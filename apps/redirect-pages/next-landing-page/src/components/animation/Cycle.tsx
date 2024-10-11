"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  items: string[];
  onCycle?: (item: string) => void;
  className?: string;
};

const animation = {
  name: "cycle",
  duration: {
    seconds: 0.75,
  },
  delay: {
    seconds: 0.3,
  },
  keyframe: {
    percentage: {
      textChange: 0.25,
    },
  },
};

// Calculate the animation timing (to trigger update) based on the percentage provided
function getTiming(percentage: number) {
  return (
    percentage * animation.duration.seconds * 1000 +
    animation.delay.seconds * 1000
  );
}

export default function Cycle(props: Props) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentAnimation, setCurrentAnimation] = useState<string | null>("");

  function restart() {
    setCurrentAnimation("");

    // Set a buffer time to avoid flickering (adjust to your preference)
    setTimeout(start, 500);
  }

  function next() {
    const index = (currentIndex + 1) % props.items.length;

    setCurrentIndex(index);

    // Notify parent component
    props.onCycle?.(props.items[index]);
  }

  function start() {
    if (props.items.length === 0) {
      return;
    }

    setCurrentAnimation("animate-cycle");

    // Set timeout to trigger next change
    setTimeout(next, getTiming(animation.keyframe.percentage.textChange));
  }

  useEffect(start, [props.items]);

  return (
    <span
      style={{
        // Override duration set in tailwind config
        animationDuration: `${animation.duration.seconds}s`,
        animationDelay: `${animation.delay.seconds}s`,
        animationTimingFunction: "ease-in-out",
      }}
      className={cn(
        "inline-flex justify-center",
        currentAnimation,
        props.className,
      )}
      onAnimationEnd={restart}
    >
      {props.items.length > 0 && props.items[currentIndex]}
    </span>
  );
}
