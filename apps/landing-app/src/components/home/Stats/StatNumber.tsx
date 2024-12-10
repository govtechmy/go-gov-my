import { getStylizedNumber } from '@/lib/number';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const ANIMATION_DURATION_MS = 1000;
const FRAMERATE = 60;
const STEPS = (ANIMATION_DURATION_MS / 1000) * FRAMERATE;
const STEP_MS = ANIMATION_DURATION_MS / STEPS;

type Props = {
  prefix?: string;
  number: number;
  size: 'small' | 'medium' | 'large';
  className?: string;
};

const variants = cva(cn('text-black-900', 'font-semibold'), {
  variants: {
    size: {
      small: 'text-[1.25rem] leading-[1.875rem]',
      medium: '',
      large: 'text-[1.5rem] leading-[2rem] lg:text-[1.875rem] lg:leading-[2.375rem]',
    },
  },
});

export default function StatNumber(props: Props) {
  const { ref, inView } = useInView({ trackVisibility: true, delay: 100 });
  const [animationNumber, setAnimationNumber] = useState(0);
  const stepValue = Math.ceil(props.number / (ANIMATION_DURATION_MS / STEP_MS));

  function canAnimate() {
    return animationNumber === 0;
  }

  function onAnimation() {
    if (!canAnimate()) {
      return;
    }

    animate(animationNumber);
  }

  function animate(number: number) {
    setTimeout(() => {
      const nextNum = number + stepValue;

      setAnimationNumber(Math.min(nextNum, props.number));

      if (nextNum < props.number) {
        animate(nextNum);
      }
    }, STEP_MS);
  }

  useEffect(() => {
    if (inView) {
      onAnimation();
    }
  }, [inView]);

  return (
    <div ref={ref} className={cn(variants({ size: props.size }), props.className)}>
      {animationNumber > 0 && props.prefix}
      {getStylizedNumber(animationNumber)}
    </div>
  );
}
