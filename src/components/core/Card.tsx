import { Variant } from "../../resources/types";

export default function Card({
  children,
  variant,
}: {
  children?: React.ReactNode;
  variant: Variant;
}) {
  const style = {
    primary: "border-fe-blue-500",
    secondary: "border-fe-orange-500",
  };

  return (
    <div
      className={`bg-slate-100 w-full min-h-20 rounded-md shadow-md ${style[variant]} border-2`}
    >
      {children}
    </div>
  );
}
