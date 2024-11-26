import { useContext } from "react";
import { StoreContext } from "../../context/storeContext";
import Dropdown from "../core/Dropdown";

export default function ModelSelect() {
  const storeContext = useContext(StoreContext);

  const { store, temperature, setTemperature } = storeContext || {};

  return (
    <div className="text-right">
      {store?.models && (
        <div>
          <span className="inline-block mr-2 font-medium underline">
            {" "}
            Choose a Model:
          </span>
          <Dropdown
            title={store.selectedModel ? store.selectedModel : "Models"}
            options={store?.models?.map((o) => ({
              ...o,
              name: o.id,
              onClick: () => {
                storeContext?.updateStore({ selectedModel: o.id });
              },
            }))}
          />
        </div>
      )}
      {temperature !== undefined && temperature !== null && setTemperature ? (
        <div className="mt-2">
          <span className="inline-block mr-2 font-medium underline">
            {" "}
            Temperature:
          </span>
          <input
            type="number"
            className="p-2 rounded-md border border-slate-100 shadow-sm text-right"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
