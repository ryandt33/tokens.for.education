import { Store } from "../../context/storeContext";
import { Role } from "../../resources/types";
import { inference } from "./call";

interface TokenInfo {
  token: string;
  logprob: number;
  prob?: number;
}

interface TokenLikelihood {
  token: string;
  likelihood: number;
  logprob: number;
  prob?: number;
}

export function calculateTokenLikelihoods(
  tokenInfos: TokenInfo[]
): TokenLikelihood[] {
  // Convert logprobs to probabilities
  const probabilities = tokenInfos.map((info) => Math.exp(info.logprob));

  // Calculate the sum of all probabilities
  const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);

  console.log({ tokenInfos });
  // Calculate the likelihood percentages
  return tokenInfos.map((info, index) => ({
    token: info.token,
    likelihood: (probabilities[index] / totalProbability) * 100,
    logprob: info.logprob,
    prob: info.prob,
  }));
}

export const generate = async (
  { messages, selectedModel }: Store,
  logprobs: boolean,
  logitBias: { [key: string]: number },
  temperature: number
) => {
  console.log(messages);
  const nullCheck = !messages?.every((m) => m.content);

  console.log({ nullCheck });
  if (nullCheck) {
    throw new Error("Please fill all the messages");
  }

  if (!messages || !Array.isArray(messages) || !selectedModel) {
    throw new Error("Missing fields");
  }

  try {
    console.log({ logprobs });
    if (!logprobs) {
      const json = await inference(
        messages,
        "",
        selectedModel,
        false,
        temperature,
        logitBias
      );

      return {
        role: Role.ASSISTANT,
        content: json.choices[0].message.content,
        tokenLogprobs: json.choices[0].logprobs.content,
        showPercent: true,
      };
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error generating message");
  }
};
