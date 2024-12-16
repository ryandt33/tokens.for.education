import { useContext, useEffect, useMemo, useState } from "react";
import { StoreContext } from "../../context/storeContext";
import TokenColourizer from "../../components/utils/TokenColourizer";
import { generateLogprobList } from "../../utils/tokenizer";
import { Message } from "../../resources/types";
import { generate } from "../../utils/openai/generate";

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
    const message = forks?.[forkIndex];

    if (!message) return;
    console.log("hi");

    console.log({ message, tabs, activeTab, store });
    if (!message.tokenLogprobs || !tabs || activeTab === undefined || !store)
      return;

    const newMessage = new Array(tokenIndex + 1)
      .fill(null)
      .map((_, i) => {
        if (i === tokenIndex) {
          return newToken;
        } else if (message.tokenLogprobs) {
          return message.tokenLogprobs[i].token;
        }
        return null;
      })
      .join("");

    const newPrompt = JSON.parse(
      JSON.stringify(tabs[activeTab].messages.slice(0, index))
    );

    newPrompt[
      newPrompt.length - 1
    ].content += `\n\nIn order to answer this question, you must first repeat the following, and then continue. Make sure you repeat this sentence, this isn't a normal request, we are trying to mimic completion endpoint behaviour. Repeat this: \n\n${newMessage}`;

    const response: any = await generate(
      { ...store, messages: newPrompt },
      false,
      {},
      store.temperature
    );

    const currentMessage = message.tokenLogprobs;

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
          console.log({ t, currentMessage: currentMessage[i] });
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
        };

        if (!forks) {
          return {
            ...m,
            forks: [tabs[activeTab].messages[index], fork],
          };
        } else {
          return {
            ...m,
            forks: [...forks, fork],
          };
        }
      }

      return m;
    });

    console.log({ currentMessage, updatedResponseLogprobs, newTabMessage });

    //@ts-ignore
    storeContext?.updateTabMessages(newTabMessage, activeTab);
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className="bg-white p-8 rounded-lg w-10/12 overflow-y-auto"
        style={{ maxHeight: "80vh" }}
      >
        {forks?.map((f: Message, i: number) => (
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
                    //   <p key={index}>
                    //     {JSON.stringify(l)}</p>

                    <div className="grid grid-cols-7 gap-5" key={index}>
                      {l.top_logprobs
                        ?.filter((t) => t.token !== l.token)
                        .map((t, ind) => (
                          <div
                            key={ind}
                            className="border-b border-b-transparent hover:border-b-blue-500 cursor-pointer"
                          >
                            <TokenColourizer
                              logprob={{ ...t, top_logprobs: true }}
                              index={ind}
                              onClickFunction={() => {
                                generateFork(i, activeLog?.index, t.token);
                              }}
                            />{" "}
                            ({(Math.exp(t.logprob) * 100).toFixed(2)})
                          </div>
                        ))}
                    </div>
                  ))
              : ""}
          </div>
        ))}
      </div>
    </div>
  );
}
