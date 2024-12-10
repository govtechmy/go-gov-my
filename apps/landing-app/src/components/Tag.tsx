import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import React, { ReactNode } from 'react';

type Props = {
  variant: 'primary';
  size: 'small';
  children: ReactNode;
  iconStart?: JSX.Element;
  className?: string;
};

const variants = cva(
  cn(
    'flex flex-row flex-nowrap items-center',
    'gap-x-[0.5rem] lg:gap-x-[0.75rem]',
    'uppercase font-semibold',
    'text-[0.75rem] leading-[1.25rem] lg:text-[0.875rem] lg:leading-[1.25rem]',
    'tracking-[0.15rem] lg:tracking-[0.175rem]'
  ),
  {
    variants: {
      variant: {
        primary: 'text-brand-600',
      },
      size: {
        small: 'text-[0.75rem] leading-[1.25rem]',
      },
    },
  }
);

const iconVariants = cva(cn('size-[1rem] lg:size-[1.25rem]'), {
  variants: {
    size: {
      small: '',
    },
  },
});

export default function Tag(props: Props) {
  return (
    <div className={cn(variants({ variant: props.variant, size: props.size }), props.className)}>
      {props.iconStart &&
        React.cloneElement(props.iconStart, {
          className: cn(iconVariants({ size: props.size }), 'stroke-current'),
        })}
      {props.children}
    </div>
  );
}
