import { useContext, useMemo } from "react";
import { StoreContext } from "../../context/storeContext";
import Button from "../../components/core/Button";
import { Message, Role } from "../../resources/types";
import { generate } from "../../utils/openai/generate";
import { LogitContext } from "../../context/logitContext";

export default function GenerationOptions() {
  const storeContext = useContext(StoreContext);
  const logitContext = useContext(LogitContext);

  const { logitBias } = logitContext || {};
  const { store, tabs, activeTab, temperature } = storeContext || {};

  const { messages, loading } = useMemo(() => {
    if (!tabs || activeTab === undefined)
      return { messages: null, loading: null };

    if (!tabs[activeTab]) return { messages: null, loading: null };

    return tabs[activeTab];
  }, [tabs, activeTab]);

  const lastRole = !messages?.length
    ? null
    : messages[messages.length - 1].role;

  const generateMessage = async (logprobs: boolean) => {
    if (!store || !messages) {
      throw new Error("Missing fields");
    } else if (loading) {
      throw new Error("Already Generating");
    }
    const tabId = storeContext?.setLoading(true);
    try {
      const response = await generate(
        { ...store, messages },
        logprobs,
        logitBias,
        temperature ?? 0
      );

      if (!response || typeof response !== "object") {
        throw new Error("Error generating message");
      }

      const updatedResponse: Message = {
        ...response,
        tokenLogprobs: response.tokenLogprobs.flat(),
      };

      storeContext?.updateTabMessages([...messages, updatedResponse]);
      storeContext?.setLoading(false, tabId);
    } catch (error) {
      storeContext?.setLoading(false, tabId);

      storeContext?.updateStore({
        error: typeof error === "string" ? error : "Error generating message",
      });
    }
  };

  return (
    <div>
      {messages && Array.isArray(messages) && (
        <div className="flex justify-center items-center gap-10">
          <Button
            onClick={() => {
              storeContext?.updateTabMessages([
                ...messages,
                {
                  role: lastRole === Role.USER ? Role.ASSISTANT : Role.USER,
                  content: "",
                },
              ]);
            }}
            children="Manually Add Response"
            variant="primary"
          />
          {lastRole === Role.USER && (
            <Button
              onClick={() => {
                generateMessage(false);
              }}
              children="Generate Response"
              variant="primary"
            />
          )}
          {/* {lastRole === Role.USER && (
            <Button
              onClick={() => {
                generateMessage(true);
              }}
              children="Generate With Logprobs"
              variant="primary"
            />
          )}{" "} */}
        </div>
      )}
    </div>
  );
}
