"use client";

import RoundedText from "@/components/RoundedText";
import Cycle from "@/components/animation/Cycle";
import { measureTextWidth } from "@/lib/dom";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { useEffect, useRef, useState } from "react";

type Props = {
  prefix?: string;
  items: string[];
  variant: "primary" | "outlined";
  weight?: "medium";
  padding?: "small";
  borderRadius?: "small";
  className?: string;
};

type Item = string;

const variants = cva("w-fit");

export default function AnimatedRoundedText(props: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [widthPx, setWidthPx] = useState(0);
  const [heightPx, setHeightPx] = useState(0);
  const [cycleItems, setCycleItems] = useState<Item[]>([]);
  const prefix = props.prefix || "";

  function setDimension(item: string) {
    const measurement = measureTextWidth(
      prefix + item,
      ref.current as HTMLElement,
    );

    if (!measurement) {
      return;
    }

    setWidthPx(measurement.width);
    setHeightPx(measurement.height);
  }

  function onCycle(item: Item) {
    setDimension(item);
  }

  function startCycle(items: Item[]) {
    setCycleItems(items);
  }

  useEffect(() => {
    if (cycleItems.length === 0) {
      return;
    }

    onCycle(cycleItems[0]);
  }, [cycleItems]);

  useEffect(() => {
    startCycle(props.items);
  }, [props.items]);

  return (
    <RoundedText
      variant={props.variant}
      weight={props.weight}
      padding={props.padding}
      borderRadius={props.borderRadius}
      className={cn(variants(), props.className)}
    >
      <span
        ref={ref}
        className={cn(
          "inline-flex", // Use inline element for transition
          "transition-all",
          props.className,
        )}
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
        }}
      >
        {cycleItems.length > 0 && widthPx > 0 && (
          <>
            {props.prefix}
            <Cycle items={cycleItems} onCycle={onCycle} />
          </>
        )}
      </span>
    </RoundedText>
  );
}
