'use client';

import RoundedText from '@/components/RoundedText';
import Cycle from '@/components/animation/Cycle';
import { measureTextWidth } from '@/lib/dom';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { useEffect, useRef, useState, useCallback } from 'react';

type Props = {
  prefix?: string;
  items: string[];
  variant: 'primary' | 'outlined';
  weight?: 'medium';
  padding?: 'small';
  borderRadius?: 'small';
  className?: string;
  interval?: number;
};

type Item = string;

const variants = cva('w-fit');

export default function AnimatedRoundedText(props: Props) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const prefix = props.prefix || '';

  const setDimension = useCallback(
    (item: string) => {
      if (ref.current) {
        const measurement = measureTextWidth(prefix + item, ref.current);
        if (measurement) {
          setDimensions({ width: measurement.width, height: measurement.height });
        }
      }
    },
    [prefix]
  );

  useEffect(() => {
    if (props.items.length > 0) {
      setDimension(props.items[0]);
    }
  }, [props.items, setDimension]);

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
        className={cn('inline-flex transition-all', props.className)}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {props.items.length > 0 && (
          <>
            {prefix}
            <Cycle items={props.items} onCycle={setDimension} interval={props.interval} />
          </>
        )}
      </span>
    </RoundedText>
  );
}
