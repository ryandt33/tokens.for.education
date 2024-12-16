export default function TokenColourizer({
  logprob,
  index,
  onClickFunction,
}: {
  logprob: any;
  index: number;
  onClickFunction: Function;
}) {
  const withProb = (prob: number) => {
    return prob > 0.97
      ? "text-blue-500"
      : prob > 0.75
      ? "text-green-500"
      : prob > 0.6
      ? "text-yellow-500"
      : prob > 0.4
      ? "text-red-500"
      : "text-purple-500";
  };

  const withLogProb = (logprob: number) =>
    logprob > -0.01
      ? "text-blue-500"
      : logprob > -0.2
      ? "text-green-500"
      : logprob > -0.5
      ? "text-yellow-500"
      : logprob > -0.8
      ? "text-red-500"
      : "text-purple-500";

  if (!logprob.top_logprobs) return null;
  return (
    <span
      key={index}
      className={`${
        logprob.prob ? withProb(logprob.prob) : withLogProb(logprob.logprob)
      } hover:underline cursor-pointer relative`}
      onClick={() => {
        onClickFunction(index);
      }}
    >
      {logprob.token}
      {logprob.token
        .split("\n")
        .filter((_t: any, i: number) => i > 0)
        .map((_t: any, i: number) => (
          <br key={i} />
        ))}
    </span>
  );
}
