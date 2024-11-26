import { useContext, useMemo } from "react";
import Card from "../../components/core/Card";
import TextArea from "../../components/core/TextArea";
import { Message, Variant } from "../../resources/types";
import { StoreContext } from "../../context/storeContext";
import Button from "../../components/core/Button";
import PieChart from "./PieChart";
import { generate } from "../../utils/openai/generate";
import LogprobBox from "./PercentLogProbs";
import { LogitContext } from "../../context/logitContext";

export default function PromptBox({
  message,
  index,
}: {
  message: Message;
  index: number;
}) {
  const storeContext = useContext(StoreContext);
  const logitContext = useContext(LogitContext);

  const { logitBias } = logitContext || {};

  const { store, tabs, activeTab, temperature } = storeContext || {};

  const { messages } = useMemo(() => {
    if (!tabs || activeTab === undefined)
      return { messages: null, loading: null };

    if (!tabs[activeTab]) return { messages: null, loading: null };

    return tabs[activeTab];
  }, [tabs, activeTab]);
  // const { messages } = store || {};

  const regenerate = async (index: number) => {
    if (!store || !messages) {
      throw new Error("Missing fields");
    }
    const tabId = storeContext?.setLoading(true);
    const newMessages = messages.filter((_m, i) => i < index);
    storeContext?.updateTabMessages(newMessages);
    try {
      const response = await generate(
        { ...store, messages: newMessages },
        false,
        logitBias,
        temperature ?? 0
      );

      if (!response || typeof response !== "object") {
        throw new Error("Error generating message");
      }

      const updatedResponse: Message = {
        ...response,
        showPercent: true,
        tokenLogprobs: response.tokenLogprobs.flat(),
      };

      console.log({ updatedResponse, messages });

      storeContext?.updateTabMessages(
        messages.map((m, i) => (i === index ? updatedResponse : m))
      );
      storeContext?.setLoading(false, tabId);
    } catch (error) {
      storeContext?.setLoading(false, tabId);

      storeContext?.updateStore({
        error: typeof error === "string" ? error : "Error generating message",
      });
    }
  };

  const showGraph = (index: number) => {
    if (!messages) return;
    const newMessages = messages?.map((m, i) =>
      i === index ? { ...m, showGraph: !m.showGraph } : m
    );

    storeContext?.updateTabMessages(newMessages);
  };

  const showPercent = (index: number) => {
    if (!messages) return;

    const newMessages = messages?.map((m, i) =>
      i === index ? { ...m, showPercent: !m.showPercent } : m
    );

    storeContext?.updateTabMessages(newMessages);
  };

  return (
    <div key={index} className="my-5">
      <Card
        variant={message.role === "user" ? Variant.SECONDARY : Variant.PRIMARY}
      >
        <div
          className="text-right mr-5 mt-3 cursor-pointer"
          onClick={() => {
            if (!messages) return;
            const newMessages = messages?.filter((_m, i) => i !== index);

            storeContext?.updateTabMessages(newMessages);
          }}
        >
          X
        </div>
        <div>
          <div className="p-4 flex w-full">
            {!message.showPercent ||
            message.role === "user" ||
            !message.tokenLogprobs ? (
              <TextArea
                className="grow w-full abc"
                title={message.role.toUpperCase() + ":"}
                content={message.content}
                onChange={(e) => {
                  if (!messages) return;

                  const newMessages = messages?.map((m, i) =>
                    i === index
                      ? { ...m, content: e.target.value, tokenLogProbs: [] }
                      : m
                  );

                  storeContext?.updateTabMessages(newMessages);
                }}
              />
            ) : (
              <LogprobBox logprobs={message.tokenLogprobs} />
            )}
            {message.role === "assistant" && message.content && (
              <div className="pl-3 w-20 mt-10">
                <Button
                  onClick={() => {
                    regenerate(index);
                  }}
                  children="⟳"
                  variant="primary"
                />
                <div className="h-1" />
                {message.tokenLikelihoods ? (
                  <Button
                    onClick={() => {
                      showGraph(index);
                    }}
                    children="◔"
                    variant="primary"
                  />
                ) : (
                  <Button
                    onClick={() => {
                      showPercent(index);
                    }}
                    children="%"
                    variant="primary"
                  />
                )}
              </div>
            )}
            {message.showGraph && message.tokenLikelihoods && (
              <div>
                <PieChart data={message.tokenLikelihoods} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
