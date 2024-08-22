"use client";

import { cn } from "@/lib/utils";
import Rive from "@rive-app/react-canvas";

type Props = {
  className?: string;
  src: string;
};

export default function AnimationCheckLink(props: Props) {
  return (
    <Rive
      src={props.src}
      stateMachines="single"
      artboard="gogov"
      className={cn(
        "h-[14.875rem] w-[21.25rem] md:h-[21.875rem] md:w-[31.25rem]",
        props.className,
      )}
    />
  );
}
