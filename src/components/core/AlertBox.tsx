import { useContext } from "react";
import { Variant } from "../../resources/types";
import { StoreContext } from "../../context/storeContext";
import Card from "./Card";

export default function AlertBox() {
  const storeContext = useContext(StoreContext);

  const { store } = storeContext || {};

  return (
    store?.error && (
      <div className="absolute top-5 right-5 border-fe-orange-500 border-2 rounded-md">
        <Card variant={Variant.SECONDARY}>
          <div
            className="text-right pr-2 cursor-pointer text-red-500"
            onClick={() => storeContext?.updateStore({ error: "" })}
          >
            x
          </div>
          <div className="text-center p-4">
            <div className="mt-4" />
            <p className="text-red-500">{store.error}</p>
            <div className="mt-4" />
          </div>
        </Card>
      </div>
    )
  );
}
