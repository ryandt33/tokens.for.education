import { StoreContext } from "../../context/storeContext";
import { useContext, useMemo } from "react";
import { LogitContext } from "../../context/logitContext";
import { tokenProcessing } from "../../utils/openai/tokens";
import {
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";

export default function LogitList({
  data,
}: {
  data: { token: string; likelihood: number }[][];
}) {
  const storeContext = useContext(StoreContext);
  const logitContext = useContext(LogitContext);

  const { store } = storeContext || {};
  const { selectedModel } = store || {};
  const { logitBias, setLogitBias } = logitContext;

  const tokens = useMemo(() => {
    const tokenDetails = data[0].map(({ token, likelihood }) => {
      const encodedToken = tokenProcessing(token);
      return { token, likelihood, encodedToken };
    });

    return tokenDetails;
  }, [data[0]]);

  if (selectedModel !== "gpt-4o-mini" && selectedModel !== "gpt-4o") {
    console.log("Model is not gpt-4o-mini");
    return <div></div>;
  }

  return (
    <div className="grid grid-cols-2 mt-5 text-left border-slate-300 border border-1 rounded-md shadow-md">
      {tokens.map(({ token, encodedToken }, i) => (
        <div
          className={`w-full h-full p-4 ${i % 2 === 0 ? "pr-9" : ""} ${
            (i / 2) % 2 > 0.5 ? "bg-blue-100" : "bg-blue-50"
          } ${`${i / 2}`}`}
          key={i}
        >
          <div className="grid grid-cols-3">
            <h1 className="col-span-2">
              <span className="text-lg font-bold">{token}:</span>{" "}
              {logitBias[encodedToken] ?? 0}
            </h1>
            <div className="text-right">
              <PlusCircleIcon
                className="w-5 h-5 text-green-500 inline-block cursor-pointer"
                onClick={() =>
                  setLogitBias({
                    ...logitBias,
                    [encodedToken]: (logitBias[encodedToken] ?? 0) + 1,
                  })
                }
              />
              <MinusCircleIcon
                className="w-5 h-5 text-orange-500 inline-block cursor-pointer"
                onClick={() =>
                  setLogitBias({
                    ...logitBias,
                    [encodedToken]: (logitBias[encodedToken] ?? 0) - 1,
                  })
                }
              />
              <XCircleIcon
                className="w-5 h-5 text-red-500 inline-block cursor-pointer"
                onClick={() =>
                  setLogitBias({
                    ...logitBias,
                    [encodedToken]: -100,
                  })
                }
              />
              <TrashIcon
                className="w-5 h-5 text-black inline-block cursor-pointer"
                onClick={() =>
                  setLogitBias({
                    ...logitBias,
                    [encodedToken]: 0,
                  })
                }
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
