import { Logprob } from "../resources/types";

export const generateLogprobList = (logprobs: Logprob[]) => {
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
};
