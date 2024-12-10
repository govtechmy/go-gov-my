import { useSlider } from './Slider';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as Popover from '@radix-ui/react-popover';

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
  const timer = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [currentStart, setCurrentStart] = useState(initialStart);
  const [currentEnd, setCurrentEnd] = useState(initialEnd);

  // Convert dates to slider values (0-100)
  const dateToValue = (date: Date) => {
    const total = endDate.getTime() - startDate.getTime();
    const current = date.getTime() - startDate.getTime();
    return (current / total) * 100;
  };

  // Convert slider values back to dates
  const valueToDate = (value: number) => {
    const total = endDate.getTime() - startDate.getTime();
    return new Date(startDate.getTime() + (total * value) / 100);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle play/pause animation
  const startTimer = () => {
    setPlay(true);
    let currentValue = dateToValue(initialEnd);

    timer.current = setInterval(() => {
      currentValue += 1;
      if (currentValue > 100) {
        currentValue = dateToValue(initialStart);
      }
      onChange(initialStart, valueToDate(currentValue));
    }, 150);
  };

  const stopTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPlay(false);
  };

  const togglePlayPause = () => {
    if (timer.current) stopTimer();
    else startTimer();
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
          minStepsBetweenThumbs={1}
          step={1}
          onValueChange={(values) => {
            const newStart = valueToDate(values[0]);
            const newEnd = valueToDate(values[1]);
            setCurrentStart(newStart);
            setCurrentEnd(newEnd);
            onChange(newStart, newEnd);
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <SliderPrimitive.Track
            className={cn(
              'bg-gray-400 relative grow rounded-full h-[8px]',
              isHovering && 'bg-blue-600'
            )}
          >
            <SliderPrimitive.Range className="absolute bg-primary rounded-full h-full" />
          </SliderPrimitive.Track>

          <Popover.Root open={isHovering}>
            <Popover.Trigger asChild>
              <SliderPrimitive.Thumb
                className={cn(
                  'block w-5 h-5 border-2 border-primary rounded-full bg-gray-50 focus:outline-none',
                  isHovering && 'border-4 border-blue-600'
                )}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-black text-white px-2 py-1 rounded-md shadow-sm z-50 text-xs border-0"
                side="top"
                sideOffset={5}
                style={{
                  backgroundColor: 'black',
                  border: 'none',
                  color: 'white',
                }}
              >
                <div>{formatDate(currentStart)}</div>
                <Popover.Arrow className="fill-black" style={{ fill: 'black' }} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <Popover.Root open={isHovering}>
            <Popover.Trigger asChild>
              <SliderPrimitive.Thumb
                className={cn(
                  'block w-5 h-5 border-2 border-primary rounded-full bg-gray-50 focus:outline-none',
                  isHovering && 'border-4 border-blue-600'
                )}
              />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="!bg-black !text-white px-2 py-1 rounded-md shadow-sm z-50 text-xs !border-0 !outline-none focus:!outline-none focus-visible:!outline-none"
                side="top"
                sideOffset={5}
                style={{
                  backgroundColor: 'black',
                  border: 'none',
                  outline: 'none',
                  boxShadow: 'none',
                  color: 'white',
                }}
                onFocus={(e) => e.target.blur()}
              >
                <div>{formatDate(currentEnd)}</div>
                <Popover.Arrow
                  className="!fill-black"
                  style={{
                    fill: 'black',
                    border: 'none',
                    outline: 'none',
                  }}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </SliderPrimitive.Root>

        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{formatDate(startDate)}</span>
          <span>{formatDate(endDate)}</span>
        </div>
      </div>
    </div>
  );
}
