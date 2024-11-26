import { useContext, useEffect, useRef, useState } from "react";
import { StoreContext } from "../../context/storeContext";
import Input from "../core/Input";

const Tab = ({
  tab,
  deletable,
  index,
}: {
  tab: { name: string };
  deletable: boolean;
  index: number;
}) => {
  const storeContext = useContext(StoreContext);

  const { activeTab } = storeContext || {};

  const [edit, setEdit] = useState(false);
  const [tabName, setTabName] = useState(tab.name);

  return (
    <div
      className={`p-2 rounded-t-md border border-fe-blue-500 border-b-0 cursor-pointer shadow-md w-32 ${
        activeTab === index
          ? "bg-fe-blue-200 font-semibold"
          : "bg-white font-normal"
      }`}
      onClick={() => {
        if (activeTab !== index) {
          storeContext?.setActiveTab(index);
        }
      }}
    >
      {edit ? (
        <div className="relative">
          {" "}
          <Input
            value={tabName}
            onChange={(e) => setTabName(e.target.value)}
            label=""
          />{" "}
          <div className="absolute -top-full right-0">
            <span
              onClick={() => {
                storeContext?.renameTab(tabName, index);
                setEdit(false);
              }}
            >
              O
            </span>{" "}
            <span
              onClick={() => {
                setTabName(tab.name);
                setEdit(false);
              }}
            >
              X
            </span>
          </div>
        </div>
      ) : (
        <div>
          {tab.name} <span onClick={() => setEdit(true)}>*</span>
          {deletable ? (
            <span
              onClick={() => storeContext?.removeTab(index)}
              className="text-red-500 font-semibold"
            >
              X
            </span>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default function TabList() {
  const storeContext = useContext(StoreContext);
  const { tabs } = storeContext || {};

  const [colCount, setColCount] = useState(5);

  const containerRef = useRef<null | HTMLDivElement>(null);

  const handleResize = () => {
    const containerWidth = containerRef?.current?.offsetWidth;

    if (!containerWidth) {
      setColCount(5);
      return;
    }

    const gridCount = Math.round(containerWidth / 130);

    if (gridCount > 10) {
      setColCount(10);
    } else {
      setColCount(gridCount);
    }
  };

  useEffect(() => {
    handleResize();
    addEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`grid grid-cols-${colCount} border-b gap-5 border-fe-blue-500`}
      ref={containerRef}
    >
      {tabs?.map((t, i) => (
        <Tab tab={t} key={i} deletable={tabs.length > 1} index={i} />
      ))}
      <div className="w-32">
        {" "}
        <div
          className="w-7 h-7 border-fe-blue-500 text-center border-2 rounded-full ml-2 relative top-2 cursor-pointer bg-white hover:shadow-md hover:bg-slate-100"
          onClick={() =>
            storeContext?.addTab({
              name: "New Tab",
              messages: [],
              loading: false,
            })
          }
        >
          +
        </div>
      </div>
    </div>
  );
}
