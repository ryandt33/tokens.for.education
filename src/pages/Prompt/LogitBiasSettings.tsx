import { useContext, useMemo, useState } from "react";
import { LogitContext } from "../../context/logitContext";
import { StoreContext } from "../../context/storeContext";
import { encodingForModel } from "js-tiktoken";
import {
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import Button from "../../components/core/Button";

export default function LogitBiasSettings() {
  const storeContext = useContext(StoreContext);
  const logitContext = useContext(LogitContext);

  const [newText, setNewText] = useState("");

  const { store } = storeContext || {};
  const { selectedModel } = store || {};
  const { logitBias, setLogitBias, open, setOpen } = logitContext;

  if (selectedModel !== "gpt-4o-mini" && selectedModel !== "gpt-4o") {
    console.log("Model is not gpt-4o-mini");
    return <div></div>;
  }

  const enc = useMemo(
    () => encodingForModel(selectedModel ?? "gpt-4o-mini"),
    [selectedModel]
  );

  const encodeToken = (token: string) => {
    const encodedToken = enc.encode(token);

    return encodedToken.map((t) => t.toString());
  };

  const decodeToken = (token: string) => {
    const decodedToken = enc.decode([Number(token)]);

    return decodedToken;
  };

  const decodedTokenMemo = useMemo(() => {
    return Object.keys(logitBias).map((key) => {
      return { key, token: decodeToken(key) };
    });
  }, [Object.keys(logitBias)]);

  console.log({ logitBias });

  return (
    <div
      className={`fixed h-screen min-w-72 top-0 right-0 bg-slate-100 border-l-2 border-slate-300 shadow-lg p-4 ${
        open ? "" : "hidden"
      }`}
    >
      <div className="overflow-y-auto h-full">
        <div className="text-right">
          <XCircleIcon
            className="w-5 h-5 text-red-500 cursor-pointer inline-block"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="mb-2">
          <input
            className="w-full my-2 p-2 rounded-md border-slate-100 shadow-sm"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <Button
            variant="primary"
            fullWidth={true}
            onClick={() => {
              const encodedTokens = encodeToken(newText);
              const newLogitBias = { ...logitBias };
              encodedTokens.forEach((t) => {
                if (!Object.keys(logitBias).includes(t)) {
                  newLogitBias[t] = 0;
                }
              });

              setLogitBias(newLogitBias);
            }}
          >
            Add Token
          </Button>
        </div>

        {Object.entries(logitBias)
          .filter(([_key, value]) => value !== 0)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([key, value], i) => {
            const token = decodedTokenMemo.find((t) => t.key === key)?.token;
            console.log({ key, value });
            return (
              <div
                key={i}
                className="flex justify-center align-middle items-center"
              >
                <h1 className="w-1/2">
                  {token}: {value}
                </h1>
                <PlusCircleIcon
                  className="w-5 h-5 text-green-500 inline-block cursor-pointer"
                  onClick={() =>
                    setLogitBias({
                      ...logitBias,
                      [key]: (value ?? 0) + 1,
                    })
                  }
                />
                <MinusCircleIcon
                  className="w-5 h-5 text-orange-500 inline-block cursor-pointer"
                  onClick={() =>
                    setLogitBias({
                      ...logitBias,
                      [key]: (value ?? 0) - 1,
                    })
                  }
                />
                <XCircleIcon
                  className="w-5 h-5 text-red-500 inline-block cursor-pointer"
                  onClick={() =>
                    setLogitBias({
                      ...logitBias,
                      [key]: -100,
                    })
                  }
                />
                <TrashIcon
                  className="w-5 h-5 text-black inline-block cursor-pointer"
                  onClick={() =>
                    setLogitBias({
                      ...logitBias,
                      [key]: 0,
                    })
                  }
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
