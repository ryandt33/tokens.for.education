import { useMemo, useState } from "react";
import { Logprob } from "../../resources/types";
import { calculateTokenLikelihoods } from "../../utils/openai/generate";
import PieChart from "./PieChart";

export default function LogprobBox({ logprobs }: { logprobs: Logprob[] }) {
  const [activeProb, setActiveProb] = useState<number | null>(null);

  const logprobList = useMemo(() => {
    return logprobs.map((lp) => {
      if (!lp.top_logprobs) return null;
      const { token, logprob } = lp;

      if (!lp.top_logprobs.find((t) => t.token === token)) {
        return {
          ...lp,
          top_logprobs: [
            ...lp.top_logprobs,
            {
              token,
              logprob,
            },
          ],
        };
      }
      return lp;
    });
  }, [logprobs]);

  return (
    <div className="w-full def">
      {logprobList &&
        logprobList
          .filter((l) => l !== null)
          .map((logprob, index) => {
            if (!logprob.top_logprobs) return null;
            console.log({ logprob });
            if (logprob.prob) {
              return (
                <span
                  key={index}
                  className={`${
                    logprob.prob > 0.97
                      ? "text-blue-500"
                      : logprob.prob > 0.75
                      ? "text-green-500"
                      : logprob.prob > 0.6
                      ? "text-yellow-500"
                      : logprob.prob > 0.4
                      ? "text-red-500"
                      : "text-purple-500"
                  } hover:underline cursor-pointer relative`}
                  onClick={() => {
                    console.log({ index });
                    setActiveProb(index);
                  }}
                >
                  {logprob.token}
                  {logprob.token
                    .split("\n")
                    .filter((_t, i) => i > 0)
                    .map((_t, i) => (
                      <br key={i} />
                    ))}
                </span>
              );
            }
            return (
              <span
                key={index}
                className={`${
                  logprob.logprob > -0.01
                    ? "text-blue-500"
                    : logprob.logprob > -0.2
                    ? "text-green-500"
                    : logprob.logprob > -0.5
                    ? "text-yellow-500"
                    : logprob.logprob > -0.8
                    ? "text-red-500"
                    : "text-purple-500"
                } hover:underline cursor-pointer relative`}
                onClick={() => {
                  console.log({ index });
                  setActiveProb(index);
                }}
              >
                {logprob.token}
                {logprob.token
                  .split("\n")
                  .filter((_t, i) => i > 0)
                  .map((_t, i) => (
                    <br key={i} />
                  ))}
              </span>
            );
          })}
      {activeProb !== null &&
        logprobList[activeProb] &&
        logprobList
          .filter((l) => l !== null)
          .filter((_l, i) => i === activeProb)
          .map((l, i) => {
            if (!l.top_logprobs) return null;
            const likelihood = calculateTokenLikelihoods(l.top_logprobs);

            return (
              <div
                key={i}
                className="w-full mt-5 border-2 border-slate-500 rounded-md p-5 text-center"
              >
                <div className="">
                  <PieChart data={[likelihood]} />
                </div>
              </div>
            );
          })}
    </div>
  );
}
