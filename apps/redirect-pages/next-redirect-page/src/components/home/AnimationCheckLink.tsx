"use client";

import { cn } from "@/lib/utils";
import Rive from "@rive-app/react-canvas";

type Props = {
  className?: string;
};

export default function AnimationCheckLink(props: Props) {
  return (
    <Rive
      src="/rive/animation.riv"
      stateMachines="single"
      artboard="gogov"
      className={cn(
        "h-[14.875rem] w-[21.25rem] md:h-[21.875rem] md:w-[31.25rem]",
        props.className,
      )}
    />
  );
}
