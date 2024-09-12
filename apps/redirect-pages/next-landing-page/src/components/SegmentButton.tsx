import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ReactNode } from "react";

type Props = {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
};

const variants = cva(
  cn(
    "rounded-full",
    "py-[0.375rem] px-[0.625rem]",
    "flex flex-row items-center justify-center",
    "text-control_sm text-dim-500 font-medium",
  ),
  {
    variants: {
      state: {
        default: "",
        selected: cn("bg-outline-200", "text-black-900"),
      },
    },
  },
);

export default function SegmentButton(props: Props) {
  return (
    <button
      className={cn(
        variants({
          state: props.selected ? "selected" : "default",
        }),
        props.className,
      )}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
}
