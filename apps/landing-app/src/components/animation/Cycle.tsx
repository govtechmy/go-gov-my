'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState, useCallback } from 'react';

type Props = {
  items: string[];
  onCycle?: (item: string) => void;
  className?: string;
  interval?: number;
};

const DEFAULT_INTERVAL = 3000; // 3 seconds

export default function Cycle(props: Props) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const next = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % props.items.length);
  }, [props.items.length]);

  useEffect(() => {
    const intervalId = setInterval(next, props.interval || DEFAULT_INTERVAL);
    return () => clearInterval(intervalId);
  }, [next, props.interval]);

  useEffect(() => {
    props.onCycle?.(props.items[currentIndex]);
  }, [currentIndex, props.items, props.onCycle]);

  return (
    <span
      className={cn('inline-flex justify-center transition-opacity duration-300', props.className)}
    >
      {props.items[currentIndex]}
    </span>
  );
}
