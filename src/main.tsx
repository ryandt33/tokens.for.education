import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StoreProvider } from "./context/storeContext.tsx";
import { LogitProvider } from "./context/logitContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <LogitProvider>
        <App />
      </LogitProvider>
    </StoreProvider>
  </StrictMode>
);
