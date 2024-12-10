import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  id?: string;
  className?: string;
  border?: 'none';
};

const variants = cva('py-[3rem] md:py-[5.25rem]', {
  variants: {
    border: {
      none: 'border-none',
    },
    padding: {
      none: 'p-0',
      noneX: 'px-0',
      noneY: 'py-0',
    },
  },
});

export default function Section(props: Props) {
  return (
    <section
      id={props.id}
      className={cn(
        'container lg:border-x lg:border-washed-100',
        variants({ border: props.border }),
        props.className
      )}
    >
      {props.children}
    </section>
  );
}
