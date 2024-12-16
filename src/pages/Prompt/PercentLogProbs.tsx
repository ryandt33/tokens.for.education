import { useMemo, useState } from "react";
import { Logprob } from "../../resources/types";
import { calculateTokenLikelihoods } from "../../utils/openai/generate";
import PieChart from "./PieChart";
import TokenColourizer from "../../components/utils/TokenColourizer";
import { generateLogprobList } from "../../utils/tokenizer";

export default function LogprobBox({ logprobs }: { logprobs: Logprob[] }) {
  const [activeProb, setActiveProb] = useState<number | null>(null);

  const logprobList = useMemo(() => {
    return generateLogprobList(logprobs);
  }, [logprobs]);

  return (
    <div className="w-full def">
      {logprobList &&
        logprobList
          .filter((l) => l !== null)
          .map((logprob, index) => (
            <TokenColourizer
              key={index}
              logprob={logprob}
              index={index}
              onClickFunction={setActiveProb}
            />
          ))}
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
