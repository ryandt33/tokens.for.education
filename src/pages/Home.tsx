import TopNav from "../components/Nav/TopNav";
import ModelSelect from "../components/utils/ModelSelect";
import AlertBox from "../components/core/AlertBox";
import TabList from "../components/Nav/TabList";
import PromptContainer from "./Prompt/PromptContainer";
import { useContext, useMemo } from "react";
import { StoreContext } from "../context/storeContext";
import LogitBiasSettings from "./Prompt/LogitBiasSettings";
import { LogitContext } from "../context/logitContext";

export default function Home() {
  const storeContext = useContext(StoreContext);
  const logitContext = useContext(LogitContext);

  const { tabs, activeTab } = storeContext || {};
  const { open, setOpen } = logitContext;

  const { loading } = useMemo(() => {
    if (!tabs || activeTab === undefined)
      return { messages: null, loading: null };

    if (!tabs[activeTab]) return { messages: null, loading: null };

    return tabs[activeTab];
  }, [tabs, activeTab]);
  return (
    <div className="bg-blue-50 min-h-screen p-5">
      <TopNav />
      <div className="bg-slate-50 w-full h-full rounded-md shadow-md border-2 border-fe-blue-500 p-5">
        <ModelSelect />
        <AlertBox />
        <div className="mt-5" />
        <TabList />
        <div className="mt-5" />
        <PromptContainer />
        {loading && (
          <div className="mt-5">
            <div className="w-32 h-32 p-2 bg-white rounded-md border-2 border-fe-blue-500 m-auto">
              <img
                src="/images/loading.gif"
                alt="loading spiiner"
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
      <LogitBiasSettings />
      {!open ? (
        <div
          onClick={() => setOpen(true)}
          className="bg-fe-blue-500 rounded-full text-white fixed bottom-5 right-5 w-20 h-20 flex justify-center items-center align-middle border-2 border-white shadow-md cursor-pointer hover:bg-fe-blue-600 transition-all duration-75"
        >
          Logits
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
