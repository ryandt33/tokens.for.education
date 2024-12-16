export enum Variant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export enum Role {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export interface Logprob {
  token: string;
  logprob: number;
  top_logprobs?: Logprob[];
  prob?: number;
}

export interface Message {
  content: string;
  role: Role;
  tokenLogprobs?: Logprob[];
  tokenLikelihoods?: {
    token: string;
    likelihood: number;
    logprob: number;
  }[][];
  showGraph?: boolean;
  showPercent?: boolean;
  forks?: Message[];
  forkedOnIndex?: number;
}

export interface Tab {
  name: string;
  messages: Message[];
  loading: boolean;
}

export type ButtonVariant = "primary" | "social";
