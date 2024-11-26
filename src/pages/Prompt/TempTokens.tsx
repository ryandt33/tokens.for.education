import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";

const recoverLogits = (probs: number[]) => {
  // Take the natural logarithm of each probability
  // const logProbs = probs.map((p) => Math.log(p));

  // console.log
  // Compute the maximum log probability for numerical stability
  const maxLogProb = Math.max(...probs);

  // Recover the original logits by subtracting the maxLogProb for stability
  const logits = probs.map((logP) => logP - maxLogProb);

  return logits;
};

const softmaxWithTemp = (logits: number[], temp: number) => {
  // Ensure temperature is not zero
  if (temp <= 0) {
    temp = 0.0001;
  }

  // Compute the maximum logit for numerical stability
  const maxLogit = Math.max(...logits);

  // Adjust the logits using the temperature and the maximum logit
  const logitsExp = logits.map((logit) => Math.exp((logit - maxLogit) / temp));

  // Compute the sum of exponentiated logits
  const expSum = logitsExp.reduce((a, b) => a + b, 0);

  // Compute and return the probabilities
  return logitsExp.map((exp) => (exp / expSum) * 100);
};

export default function TempTokens({
  data,
}: {
  data: { token: string; likelihood: number; logprob: number }[][];
}) {
  const [temperature, setTemperature] = useState<number>(0);

  const softMaxConverted = useMemo(() => {
    const logits = recoverLogits(data[0].map((d) => d.logprob));
    const softMaxConverted = softmaxWithTemp(logits, temperature);

    return data[0].map((d, i) => ({
      ...d,
      updatedLikelihood: softMaxConverted[i],
    }));
  }, [data, temperature]);

  const echartOptions = useMemo(() => {
    if (!softMaxConverted || !softMaxConverted.length) return null;

    return {
      xAxis: {
        type: "category",
        data: softMaxConverted.map((d) => d.token),
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: softMaxConverted.map((d) => d.updatedLikelihood),
          type: "line",
          smooth: true,
        },
      ],
      tooltip: {
        trigger: "axis", // 'axis' shows tooltip for all series at the axis, 'item' shows only for hovered item
        formatter: function (
          params: {
            axisValue: string;
            data: number;
          }[]
        ) {
          return `${params[0].axisValue}: ${
            Math.floor(params[0].data * 100) / 100
          }%`;
        },
      },
    };
  }, [softMaxConverted]);

  return (
    <div>
      <ReactECharts style={{ height: "500px" }} option={echartOptions} />
      <input
        type="range"
        min="0"
        max="10"
        step="0.1"
        value={temperature}
        onChange={(e) => setTemperature(Number(e.target.value))}
      />
      <p>Temperature: {temperature}</p>
    </div>
  );
}
