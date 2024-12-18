import { useContext, useEffect, useMemo, useState } from "react";
import { StoreContext } from "../../context/storeContext";
import TokenColourizer from "../../components/utils/TokenColourizer";
import { generateLogprobList } from "../../utils/tokenizer";
import { Message } from "../../resources/types";
import { generate } from "../../utils/openai/generate";
import ForkTree from "./ForkTree";
import Button from "../../components/core/Button";
import {
  chebyshevDistance,
  cosineSimilarity,
  dotProduct,
  euclideanDistance,
  jaccardDistance,
  manhattanDistance,
  reduceEmbeddingsTo2D,
} from "../../utils/embeddings";
import EChartsReact from "echarts-for-react";

export default function ForkOverlay({
  props: { activeTab, index },
  setOpen,
}: {
  props: { activeTab: number | undefined; index: number };
  setOpen: React.Dispatch<
    React.SetStateAction<{
      activeTab: number | undefined;
      index: number;
    } | null>
  >;
}) {
  const storeContext = useContext(StoreContext);
  const { tabs, store } = storeContext || {};

  const [activeLog, setActiveLog] = useState<{
    fork: number;
    index: number;
  } | null>(null);
  const [topP, setTopP] = useState(0.9);
  const [topK, setTopK] = useState(2);
  const [maxForks, setMaxForks] = useState(10);
  const [temperature, setTemperature] = useState(0);
  const [scatter, setScatter] = useState<
    null | { value: number[]; name: string }[]
  >(null);

  const message = useMemo(() => {
    if (!tabs || activeTab === undefined) return null;

    if (!tabs[activeTab]) return null;

    return tabs[activeTab].messages[index];
  }, [tabs, activeTab, index]);

  const forks = useMemo(() => {
    if (!message) return;

    return message.forks ?? [message];
  }, [message]);

  const closeClickListener = (e: MouseEvent) => {
    if ((e.target as HTMLElement)?.className?.includes?.("fixed")) {
      setOpen(null);
    }
  };

  useEffect(() => {
    window.addEventListener("click", closeClickListener);
    return () => {
      window.removeEventListener("click", closeClickListener);
    };
  }, []);

  const generateFork = async (
    forkIndex: number,
    tokenIndex: number,
    newToken: string
  ) => {
    const parentMessage = forks?.[forkIndex];

    if (!parentMessage) return;

    if (
      !parentMessage.tokenLogprobs ||
      !tabs ||
      activeTab === undefined ||
      !store
    )
      return;

    const newMessage = new Array(tokenIndex + 1)
      .fill(null)
      .map((_, i) => {
        if (i === tokenIndex) {
          return newToken;
        } else if (parentMessage.tokenLogprobs) {
          return parentMessage.tokenLogprobs[i].token;
        }
        return null;
      })
      .join("");

    const newPrompt = JSON.parse(
      JSON.stringify(tabs[activeTab].messages.slice(0, index))
    );

    newPrompt[
      newPrompt.length - 1
    ].content += `\n\nBegin your answer with the following: \n\n${newMessage}`;

    const response: any = await generate(
      { ...store, messages: newPrompt },
      false,
      {},
      temperature
    );

    const distance =
      parentMessage.embedding && response.embedding
        ? {
            eucDist: euclideanDistance(
              response.embedding,
              parentMessage.embedding
            ),
            cosSim: cosineSimilarity(
              response.embedding,
              parentMessage.embedding
            ),
            dotProd: dotProduct(response.embedding, parentMessage.embedding),
            manDist: manhattanDistance(
              response.embedding,
              parentMessage.embedding
            ),
            chebyDist: chebyshevDistance(
              response.embedding,
              parentMessage.embedding
            ),
            jaccDist: jaccardDistance(
              response.embedding,
              parentMessage.embedding
            ),
          }
        : {};

    const currentMessage = parentMessage.tokenLogprobs;

    const updatedResponseLogprobs = response?.tokenLogprobs.map(
      (t: any, i: number) => {
        if (i < tokenIndex) {
          if (!currentMessage?.[i]) {
            console.log("BROKEN");
            return null;
          }
          if (t.token !== currentMessage[i].token) return null;

          return currentMessage[i];
        } else if (i === tokenIndex) {
          if (!currentMessage?.[i]) {
            console.log("BROKEN");
            return null;
          }
          const tLogprob = currentMessage[i].top_logprobs?.find(
            (l: any) => l.token === t.token
          )?.logprob;
          return { ...t, logprob: tLogprob ?? t.logprob };
        } else {
          return t;
        }
      }
    );

    if (updatedResponseLogprobs.includes(null)) {
      console.log("BORKED");
      return;
    }

    const newTabMessage = tabs[activeTab].messages.map((m, j) => {
      if (j === index) {
        const { forks } = m;
        const fork = {
          ...response,
          tokenLogprobs: updatedResponseLogprobs,
          forkedOnToken: tokenIndex,
          forkIndex,
          distance,
        };

        if (!forks) {
          return {
            ...m,
            forks: [
              {
                ...tabs[activeTab].messages[index],
                confidence: tabs[activeTab].messages[index]?.tokenLogprobs
                  ? (
                      (tabs[activeTab].messages[index]?.tokenLogprobs?.reduce(
                        (acc, f) => {
                          return acc + Math.exp(f.logprob);
                        },
                        0
                      ) /
                        tabs[activeTab].messages[index].tokenLogprobs.length) *
                      100
                    ).toFixed(2)
                  : 0,
                distance: {},
              },
              {
                ...fork,
                confidence: fork?.tokenLogprobs
                  ? (
                      (fork?.tokenLogprobs?.reduce((acc: any, f: any) => {
                        return acc + Math.exp(f.logprob);
                      }, 0) /
                        fork.tokenLogprobs.length) *
                      100
                    ).toFixed(2)
                  : 0,
                distance,
              },
            ],
          };
        } else {
          return {
            ...m,
            forks: [
              ...forks,
              {
                ...fork,
                confidence: fork?.tokenLogprobs
                  ? (
                      (fork?.tokenLogprobs?.reduce((acc: any, f: any) => {
                        return acc + Math.exp(f.logprob);
                      }, 0) /
                        fork.tokenLogprobs.length) *
                      100
                    ).toFixed(2)
                  : 0,
                distance,
              },
            ],
          };
        }
      }

      return m;
    });

    //@ts-ignore
    storeContext?.updateTabMessages(newTabMessage, activeTab);
  };

  const generateForks = async () => {
    console.log({ message, topP, topK });
    let forkCount = 0;

    if (!message) return;

    const { tokenLogprobs } = message;

    if (!tokenLogprobs) return;

    for (let i = 0; i < tokenLogprobs.length; i++) {
      const prob = tokenLogprobs[i];

      if (!prob.top_logprobs) continue;
      const forks = [];
      let currentP = 0;

      for (const topProb of prob.top_logprobs) {
        currentP += Math.exp(topProb.logprob);

        forks.push(topProb.token);

        if (currentP > topP) break;

        if (forks.length >= topK) break;
      }

      if (forks.length < 2) continue;

      for (let j = 1; j < forks.length; j++) {
        const fork = forks[j];

        if (forkCount >= maxForks) return;
        forkCount++;
        generateFork(0, i, fork);
      }
    }
  };

  useEffect(() => {
    if (forks && forks.length > 16) {
      const forksWithEmbeddings = forks.filter((fork) => !!fork.embedding);

      const embeddings = forksWithEmbeddings
        .map((fork) => fork.embedding)
        .filter((embedding): embedding is number[] => embedding !== undefined);

      if (embeddings.length === 0) return;

      const twoD = reduceEmbeddingsTo2D(embeddings);

      const scatter = twoD?.map((point, i) => {
        return {
          value: point,
          name: forksWithEmbeddings[i].content,
          starting: i === 0,
        };
      });

      console.log(scatter);

      if (!twoD?.[0]?.length || !scatter) return;

      setScatter(scatter);
    }
  }, [forks]);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="bg-white p-8 rounded-lg w-10/12 overflow-y-auto"
        style={{ maxHeight: "80vh" }}
      >
        <div className="grid grid-cols-4">
          <div>
            {" "}
            <input
              type="range"
              min="0"
              max="0.99"
              step="0.01"
              value={topP}
              onChange={(e) => setTopP(Number(e.target.value))}
            />
            <p>Top P: {topP}</p>
          </div>
          <div>
            <input
              type="range"
              min="2"
              max="4"
              step="1"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
            />
            <p>Top K: {topK}</p>
          </div>
          <div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={maxForks}
              onChange={(e) => setMaxForks(Number(e.target.value))}
            />
            <p>Max Forks: {maxForks}</p>
          </div>
          <div>
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
            />
            <p>Temperature: {temperature}</p>
          </div>
        </div>

        <div className="m-auto w-44 mt-5">
          {" "}
          <Button
            onClick={() => generateForks()}
            children="Generate Forks"
            variant="primary"
          />
        </div>
        {/* {message ? (
          <ForkTree forks={message.forks ? message.forks : [message]} />
        ) : (
          ""
        )} */}
        {scatter ? (
          <EChartsReact
            option={{
              xAxis: {},
              yAxis: {},
              series: [
                {
                  type: "scatter",
                  data: scatter,
                  itemStyle: {
                    // Dynamic color based on params
                    color: (params: any) => {
                      return params.data.starting ? "red" : "blue"; // Red if starting, otherwise blue
                    },
                  },
                },
              ],
              tooltip: {
                trigger: "item",
                formatter: (params: any) => {
                  // Wrap the tooltip content in a <div> with a class for styling
                  return `
                    <div style="white-space: normal; word-wrap: break-word; max-width: 400px;">
                      ${params.name}
                    </div>
                  `;
                },
                backgroundColor: "#fff",
                borderColor: "#000",
                borderWidth: 1,
                extraCssText: `
                  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                  max-width: 400px;
                  white-space: normal;
                  word-wrap: break-word;
                `,
                textStyle: {
                  color: "#000", // Text color
                  fontSize: 12, // Font size
                },
              },
            }}
          />
        ) : (
          ""
        )}
        {forks
          ?.sort(
            (a, b) => Number(b?.distance?.cosSim) - Number(a?.distance?.cosSim)
          )
          ?.map((f: Message, i: number) => (
            <div key={i} className="mt-4 border-b border-b-fe-blue-500">
              #{i + 1}:{" "}
              {generateLogprobList(f?.tokenLogprobs ?? []).map(
                (logprob, index) => (
                  <TokenColourizer
                    key={index}
                    logprob={logprob}
                    index={index}
                    onClickFunction={() => {
                      setActiveLog({ fork: i, index });
                    }}
                  />
                )
              )}
              {activeLog?.fork === i && f.tokenLogprobs
                ? f.tokenLogprobs
                    .filter((_t, index) => activeLog.index === index)
                    .map((l, index) => (
                      <div className="grid grid-cols-7 gap-5" key={index}>
                        {l.top_logprobs
                          ?.filter((t) => t.token !== l.token)
                          .map((t, ind) => (
                            <div
                              key={ind}
                              className="border-b border-b-transparent hover:border-b-blue-500 cursor-pointer"
                              onClick={() =>
                                generateFork(i, activeLog?.index, t.token)
                              }
                            >
                              <TokenColourizer
                                logprob={{ ...t, top_logprobs: true }}
                                index={ind}
                                onClickFunction={() => {}}
                              />{" "}
                              ({(Math.exp(t.logprob) * 100).toFixed(2)})
                            </div>
                          ))}
                      </div>
                    ))
                : ""}
              <br />
              <p>Confidence: {f?.confidence ?? ""}</p>
              <p>Euclidean Distance: {f?.distance?.eucDist ?? ""}</p>
              <p>Cosine Similarity: {f?.distance?.cosSim ?? ""}</p>
              <p>Dot Product: {f?.distance?.dotProd ?? ""}</p>
              <p>Manhattan Distance: {f?.distance?.manDist ?? ""}</p>
              <p>Chebyshev Distance: {f?.distance?.chebyDist ?? ""}</p>
              <p>Jaccard Distance: {f?.distance?.jaccDist ?? ""}</p>
              <p>Forked On Token: {f.forkedOnToken ?? ""}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
