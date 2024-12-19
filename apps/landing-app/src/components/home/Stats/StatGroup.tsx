import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function StatGroup(props: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "col-span-1",
        "flex flex-col md:items-center",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}
