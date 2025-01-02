import { useSlider } from "./Slider";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as Popover from "@radix-ui/react-popover";

interface RangeSliderProps {
  startDate: Date;
  endDate: Date;
  initialStart: Date;
  initialEnd: Date;
  onChange: (start: Date, end: Date) => void;
  locale: string;
}

export default function RangeSlider({
  startDate,
  endDate,
  initialStart,
  initialEnd,
  onChange,
  locale,
}: RangeSliderProps) {
  const { play, setPlay } = useSlider();
  const timer = useRef<number | null>(null);
  const [hoveredThumb, setHoveredThumb] = useState<number | null>(null);
  const [currentStart, setCurrentStart] = useState(initialStart);
  const [currentEnd, setCurrentEnd] = useState(initialEnd);

  const dateToValue = (date: Date) => {
    const total = endDate.getTime() - startDate.getTime();
    const current = date.getTime() - startDate.getTime();
    return (current / total) * 100;
  };

  const valueToDate = (value: number) => {
    const total = endDate.getTime() - startDate.getTime();
    return new Date(startDate.getTime() + (total * value) / 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  return (
    <div className="relative pt-8">
      <div className="mx-12">
        <SliderPrimitive.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          defaultValue={[dateToValue(initialStart), dateToValue(initialEnd)]}
          step={1}
          onValueChange={(values) => {
            const newStart = valueToDate(values[0]);
            const newEnd = valueToDate(values[1]);
            setCurrentStart(newStart);
            setCurrentEnd(newEnd);
            onChange(newStart, newEnd);
          }}
        >
          {/* Track */}
          <SliderPrimitive.Track className="relative w-full h-[8px] bg-gray-400 rounded-full">
            {/* Range */}
            <SliderPrimitive.Range className="absolute bg-blue-600 rounded-full h-full" />
          </SliderPrimitive.Track>

          {/* Thumbs */}
          {[currentStart, currentEnd].map((date, index) => (
            <Popover.Root key={index} open={hoveredThumb === index}>
              <Popover.Trigger asChild>
                <SliderPrimitive.Thumb
                  className={cn(
                    "block w-5 h-5 border-2 border-primary border-blue-600 rounded-full bg-gray-50 focus:outline-none",
                    hoveredThumb === index && "border-4 border-blue-600"
                  )}
                  onMouseEnter={() => setHoveredThumb(index)}
                  onMouseLeave={() => setHoveredThumb(null)}
                  aria-label={`Thumb ${index + 1}`}
                />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="bg-black text-white px-2 py-1 rounded-md shadow-sm z-50 text-xs"
                  side="top"
                  sideOffset={5}
                >
                  <div>{formatDate(date)}</div>
                  <Popover.Arrow className="fill-black" />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ))}
        </SliderPrimitive.Root>

        {/* Start and End Dates */}
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{formatDate(startDate)}</span>
          <span>{formatDate(endDate)}</span>
        </div>
      </div>
    </div>
  );
}
