import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ReactNode } from "react";

type Props = {
  className?: string;
  textSize?: "small" | "caption";
  textAlign?: "left" | "center" | "right";
  textColor?: "black" | "gray";
  children: ReactNode;
};

const variants = cva(
  "text-black-700 text-pretty text-[1rem] text-start leading-[1.5rem] text-paragraph",
  {
    variants: {
      textSize: {
        small: "text-[0.875rem] leading-[1.25rem]",
        caption: "text-[0.75rem] leading-[1.125rem]",
      },
      textAlign: {
        left: "text-start",
        center: "text-center",
        right: "text-end",
      },
      textColor: {
        black: "text-black-700",
        gray: "text-gray-dim-500",
      },
    },
  },
);

export function Paragraph(props: Props) {
  return (
    <p
      className={cn(
        variants({
          textSize: props.textSize,
          textAlign: props.textAlign,
          textColor: props.textColor,
        }),
        props.className,
      )}
    >
      {props.children}
    </p>
  );
}
