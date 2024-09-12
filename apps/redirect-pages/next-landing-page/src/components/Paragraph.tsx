import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

const variants = cva(
  cn(
    "text-black-700 text-pretty text-[0.875rem] leading-[1.25rem]",
    "md:text-[1rem] md:leading-[1.5rem]",
    "text-start ",
  ),
  {
    variants: {
      size: {
        // Define additional sizes here
      },
    },
  },
);

export default function Paragraph(props: Props) {
  return <p className={cn(variants(), props.className)}>{props.children}</p>;
}
