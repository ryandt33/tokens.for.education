import { Message } from "../../resources/types";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const getModels = async (
  apiKey: string
): Promise<{ id: string }[] | boolean> => {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const { data } = await res.json();

    const gptModels = data.filter(
      (model: { id: string }) =>
        model.id.includes("gpt") && !model.id.includes("vision")
    );

    return gptModels;
  } catch (error) {
    console.error(error);

    return false;
  }
};

export const inference = async (
  messages: Message[],
  apiKey: string,
  model: string,
  logprobs: boolean = false,
  temperature: number,
  logitBias?: { [key: string]: number }
) => {
  const body = JSON.stringify({
    max_tokens: logprobs
      ? 5
      : logitBias && Object.values(logitBias).some((v) => v > 0)
      ? 100
      : 4096,
    messages,
    model,
    temperature,
    logprobs: true,
    stream: false,
    top_logprobs: 20,
    seed: 42,
    logit_bias: logitBias ?? {},
  });

  const res = await fetch(`${BACKEND_URL}/api`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body,
  });
  try {
    const json = await res.json();

    return json;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to generate response");
  }
};

export const pos = async (tokens: any[]) => {
  const body = JSON.stringify({
    tokens,
  });

  const res = await fetch(`${BACKEND_URL}/api/pos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  try {
    const json = await res.json();

    return json;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to generate response");
  }
};

export const getEmbedding = async (content: string) => {
  const body = JSON.stringify({
    content,
  });

  const res = await fetch(`${BACKEND_URL}/api/embedding`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });

  try {
    const json = await res.json();

    return json;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to generate response");
  }
};

export const verifyApiKey = async (apiKey: string) => {
  const models = await getModels(apiKey);

  if (models) {
    return models;
  } else {
    return false;
  }
};
