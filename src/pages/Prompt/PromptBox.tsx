import { useContext, useMemo, useState } from "react";
import Card from "../../components/core/Card";
import TextArea from "../../components/core/TextArea";
import { Message, Variant } from "../../resources/types";
import { StoreContext } from "../../context/storeContext";
import Button from "../../components/core/Button";
import PieChart from "./PieChart";
import { generate } from "../../utils/openai/generate";
import LogprobBox from "./PercentLogProbs";
import { LogitContext } from "../../context/logitContext";
import ForkOverlay from "./ForkOverlay";

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

  const [forkView, setForkView] = useState<{
    activeTab: number | undefined;
    index: number;
  } | null>(null);

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

  const showPercent = (index: number) => {
    if (!messages) return;

    const newMessages = messages?.map((m, i) =>
      i === index ? { ...m, showPercent: !m.showPercent } : m
    );

    storeContext?.updateTabMessages(newMessages);
  };

  return (
    <div key={index} className="my-5">
      {forkView ? <ForkOverlay props={forkView} setOpen={setForkView} /> : ""}
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
                <Button
                  onClick={() => {
                    showPercent(index);
                  }}
                  children={message.showPercent ? "✏️" : "%"}
                  variant="primary"
                />
                <Button
                  className="mt-2"
                  onClick={() => {
                    setForkView({ activeTab, index });
                  }}
                >
                  <svg
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0px"
                    y="0px"
                    viewBox="0 0 490.667 490.667"
                  >
                    <g>
                      <g>
                        <path
                          d="M458.667,341.333h-53.333V288c0-29.397-23.936-53.333-53.333-53.333h-96v-85.333h53.333
                      c5.888,0,10.667-4.779,10.667-10.667v-128C320,4.779,315.221,0,309.333,0h-128c-5.888,0-10.667,4.779-10.667,10.667v128
                      c0,5.888,4.779,10.667,10.667,10.667h53.333v85.333h-96c-29.397,0-53.333,23.936-53.333,53.333v53.333H32
                      c-5.888,0-10.667,4.779-10.667,10.667v128c0,5.888,4.779,10.667,10.667,10.667h128c5.888,0,10.667-4.779,10.667-10.667V352
                      c0-5.888-4.779-10.667-10.667-10.667h-53.333V288c0-17.643,14.357-32,32-32H352c17.643,0,32,14.357,32,32v53.333h-53.333
                      c-5.888,0-10.667,4.779-10.667,10.667v128c0,5.888,4.779,10.667,10.667,10.667h128c5.888,0,10.667-4.779,10.667-10.667V352
                      C469.333,346.112,464.555,341.333,458.667,341.333z M149.333,362.667v106.667H42.667V362.667H149.333z M192,128V21.333h106.667
                      V128H192z M448,469.333H341.333V362.667H448V469.333z"
                          fill="#FFFFFF"
                        />
                      </g>
                    </g>
                  </svg>
                </Button>
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
