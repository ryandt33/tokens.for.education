import { useContext, useMemo } from "react";
import { StoreContext } from "../../context/storeContext";
import { Message } from "../../resources/types";
import PromptBox from "./PromptBox";
import GenerationOptions from "./GenerationOptions";

export default function PromptContainer() {
  const storeContext = useContext(StoreContext);
  const { tabs, activeTab } = storeContext || {};

  const { messages } = useMemo(() => {
    if (!tabs || activeTab === undefined)
      return { messages: null, loading: null };

    if (!tabs[activeTab]) return { messages: null, loading: null };

    return tabs[activeTab];
  }, [tabs, activeTab]);

  return (
    <div>
      {messages?.map((message: Message, index) => (
        <PromptBox key={index} message={message} index={index} />
      ))}
      <GenerationOptions />
    </div>
  );
}
