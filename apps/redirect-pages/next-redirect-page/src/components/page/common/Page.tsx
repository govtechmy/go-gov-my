import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import QuickLinks from "./QuickLinks";

type Props = {
  children: ReactNode;
};

export default async function Page(props: Props) {
  return (
    <main
      className={cn(
        "pt-[5rem] md:pt-[4rem] lg:pt-[7rem]",
        "px-[1.125rem] lg:px-0",
        "h-full w-full",
        "flex grow flex-col items-center justify-start",
      )}
    >
      <div
        className={cn(
          "flex grow flex-col items-center justify-start tall:justify-center",
        )}
      >
        {props.children}
      </div>
      <QuickLinks />
    </main>
  );
}
