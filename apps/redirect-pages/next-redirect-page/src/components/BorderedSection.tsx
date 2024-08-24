import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function BorderedSection(props: Props) {
  return (
    <section
      id={props.id}
      className={cn(
        "container lg:border-x lg:border-washed-100",
        props.className,
      )}
    >
      {props.children}
    </section>
  );
}
