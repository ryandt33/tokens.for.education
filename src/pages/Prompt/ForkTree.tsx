import { useMemo } from "react";
import { Message } from "../../resources/types";
import EChartsReact from "echarts-for-react";

const forkLoop = ({
  forks,
  forkIndex,
  child,
  tokenIndex,
}: {
  forks: Message[];
  forkIndex: number;
  child: any[];
  tokenIndex: number;
}) => {
  const fork = forks[forkIndex];
  if (tokenIndex !== -1 && !fork?.tokenLogprobs?.[tokenIndex]?.token) return [];
  const forkMap = {
    name: tokenIndex !== -1 ? fork?.tokenLogprobs?.[tokenIndex].token : "",
    children: child,
  };

  let nameString: string = "";

  for (let i = tokenIndex; i < fork.tokenLogprobs!.length; i++) {
    const forkChildIndexes = forks.reduce((indexes: number[], f, idx) => {
      if (f.forkIndex === forkIndex && f.forkedOnToken === i + 1) {
        indexes.push(idx);
      }
      return indexes;
    }, []);

    if (i !== -1) nameString += fork.tokenLogprobs![i].token;

    forkMap.name = nameString;

    if (forkChildIndexes.length > 0) {
      for (const forkChildIndex of forkChildIndexes) {
        child.push(
          forkLoop({
            forks,
            forkIndex: forkChildIndex,
            child: [],
            tokenIndex: i + 1,
          })
        );
      }
      child.push(forkLoop({ forks, forkIndex, child: [], tokenIndex: i + 1 }));
      return forkMap;
    }
  }

  return forkMap;
};

export default function ForkTree({ forks }: { forks: Message[] }) {
  const mapData = useMemo(() => {
    const child: any = [];

    const forkMap = forkLoop({ forks, forkIndex: 0, child, tokenIndex: -1 });
    return forkMap;
  }, [forks]);

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: "item",
        triggerOn: "mousemove",
      },
      series: [
        {
          type: "tree",
          data: [mapData],
          top: "1%",
          left: "7%",
          bottom: "1%",
          right: "20%",
          symbolSize: 7,
          label: {
            position: "left",
            verticalAlign: "middle",
            align: "right",
          },
          leaves: {
            label: {
              position: "right",
              verticalAlign: "middle",
              align: "left",
            },
          },
          animationDuration: 550,
          animationDurationUpdate: 750,
          initialTreeDepth: 10, // Add this line
          curviness: 1,
          width: "100%",
        },
      ],
    };
  }, [mapData]);

  return <div>{option ? <EChartsReact option={option} /> : ""}</div>;
}
