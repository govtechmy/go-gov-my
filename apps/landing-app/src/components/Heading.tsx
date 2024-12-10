import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

type Props = {
  children: string;
  level: 1 | 2;
  className?: string;
};

const variants = cva('font-semibold text-balance', {
  variants: {
    level: {
      1: 'text-[1.875rem] leading-[2.375rem] md:text-[2.25rem] md:leading-[2.75rem]',
      2: 'text-[1.5rem] leading-[2rem] md:text-[1.875rem] md:leading-[2.375rem]',
    },
  },
});

export default function Heading(props: Props) {
  const Component = `h${props.level}` as keyof React.JSX.IntrinsicElements;

  return (
    <Component className={cn(variants({ level: props.level }), props.className)}>
      {props.children}
    </Component>
  );
}
