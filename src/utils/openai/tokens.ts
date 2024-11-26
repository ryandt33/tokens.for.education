import { encodingForModel } from "js-tiktoken";
const enc = encodingForModel("gpt-4o-mini");

export const tokenProcessing = (token: string): number => {
  return enc.encode(token)[0];
};
