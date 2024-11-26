import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import LogitList from "./LogitList";
import TempTokens from "./TempTokens";

type TokenData = {
  token: string;
  likelihood: number;
  logprob: number;
};

type Props = {
  data: TokenData[][];
};

const PieChart: React.FC<Props> = ({ data }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [display, setDisplay] = useState<"pie" | "logits" | "temp">("pie");

  const getChartOptions = (tokenData: TokenData[]) => {
    const total = tokenData.reduce((sum, item) => sum + item.likelihood, 0);
    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        formatter: (name: string) => {
          const item = tokenData.find((d) => d.token === name);
          if (item) {
            const percentage = ((item.likelihood / total) * 100).toFixed(2);
            return `${name}: ${percentage}%`;
          }
          return name;
        },
      },
      series: [
        {
          type: "pie",
          radius: "50%",
          data: tokenData.map((item) => ({
            name: item.token,
            value: item.likelihood,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          label: {
            show: false,
          },
          labelLine: {
            show: false,
          },
        },
      ],
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex mb-4 flex-wrap">
        {data.map((arr, index) => (
          <button
            key={index}
            className={`px-4 py-2 m-1 rounded ${
              activeTabIndex === index
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTabIndex(index)}
          >
            {arr[0].token}
          </button>
        ))}
      </div>
      <div className="flex justify-center">
        <div
          className="w-1/2 mx-4 text-white bg-blue-400 p-2 rounded cursor-pointer hover:bg-blue-600 shadow-md"
          onClick={() => setDisplay("pie")}
        >
          Pie Chart
        </div>
        <div
          className="w-1/2 mx-4 text-white bg-blue-400 p-2 rounded cursor-pointer hover:bg-blue-600 shadow-md"
          onClick={() => setDisplay("logits")}
        >
          Logits
        </div>
        <div
          className="w-1/2 mx-4 text-white bg-blue-400 p-2 rounded cursor-pointer hover:bg-blue-600 shadow-md"
          onClick={() => setDisplay("temp")}
        >
          Temperature
        </div>
      </div>
      {display === "pie" ? (
        <div className="mt-4">
          <ReactECharts
            option={getChartOptions(data[activeTabIndex])}
            style={{ height: "500px" }}
          />
        </div>
      ) : display === "logits" ? (
        <LogitList data={data} />
      ) : (
        <TempTokens data={data} />
      )}
    </div>
  );
};

export default PieChart;
