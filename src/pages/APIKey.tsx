import { useContext, useEffect, useState } from "react";
import Button from "../components/core/Button";
import Card from "../components/core/Card";
import Input from "../components/core/Input";
import { verifyApiKey } from "../utils/openai/call";
import { StoreContext } from "../context/storeContext";
import { Variant } from "../resources/types";
import { useNavigate } from "react-router-dom";

export default function Init() {
  const storeContext = useContext(StoreContext);
  const { store } = storeContext || {};
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (!store?.apiKey) {
      navigate("/");
    }
    if (window.location.pathname === "/" && store?.apiKey) {
      navigate("/home");
    }
  }, [store, navigate]);

  const saveModels = async () => {
    const models = await verifyApiKey(apiKey);

    if (models && typeof models === "object") {
      storeContext?.updateStore({ apiKey, models, error: "" });
      navigate("/home");
    } else {
      storeContext?.updateStore({ error: "Invalid API Key" });
    }
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      style={{
        backgroundImage: "url(/images/bg.png)",
        backgroundSize: "cover",
      }}
    >
      {store?.error && (
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
      )}
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="w-8/12">
          <Card variant={Variant.PRIMARY}>
            <div className="text-center p-4">
              <img
                src="/images/logos/openai.png"
                alt="OpenAI"
                className="w-8 h-8 mr-6 mx-auto inline-block"
              />
              <span>OpenAI API Key</span>
              <div className="mt-4" />
              <Input
                label="API Key"
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
              />
              <Button
                variant="primary"
                className="mt-4 w-28 m-auto"
                onClick={() => {
                  saveModels();
                }}
              >
                Submit
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
