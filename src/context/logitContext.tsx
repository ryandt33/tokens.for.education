import React, { createContext } from "react";

export interface Logit {
  [key: string]: number;
}

export interface LogitContextType {
  logitBias: Logit;
  open: boolean;
  setLogitBias: (logit: Logit) => void;
  setOpen: (open: boolean) => void;
}

export const LogitContext = createContext<LogitContextType>({
  logitBias: {},
  open: false,
  setLogitBias: () => {},
  setOpen: () => {},
});

interface LogitProviderProps {
  children: React.ReactNode;
}

export const LogitProvider: React.FC<LogitProviderProps> = ({ children }) => {
  const [logitBias, setLogitBias] = React.useState<Logit>({});
  const [open, setOpen] = React.useState<boolean>(false);

  return (
    <LogitContext.Provider value={{ logitBias, setLogitBias, open, setOpen }}>
      {children}
    </LogitContext.Provider>
  );
};
