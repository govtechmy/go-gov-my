import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import { ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
  variant: 'primary' | 'outlined' | 'danger';
  textSize?: 'small' | 'smallFixed';
  textStyle?: 'uppercase';
  weight?: 'medium';
  padding?: 'small';
  borderRadius?: 'small';
  style?: React.CSSProperties;
};

const variants = cva(cn('rounded-full', 'px-[0.5rem] py-[0.25rem]'), {
  variants: {
    variant: {
      primary: 'bg-brand-50 text-brand-600',
      outlined: 'bg-transparent border-outline-200 border',
      danger: 'bg-danger-50 text-danger-600',
    },
    textSize: {
      small: 'text-[0.75rem] leading-[1.125rem] md:text-[1rem] md:leading-[1.5rem]',
      smallFixed: 'text-[0.75rem] leading-[1.125rem]',
    },
    textStyle: {
      uppercase: 'uppercase',
    },
    weight: {
      medium: 'font-medium',
    },
    padding: {
      small: 'px-[0.25rem]',
    },
    borderRadius: {
      small: 'rounded-[0.375rem]',
    },
  },
});

/**
 * A text component that has a rounded background using the brand color.
 */
export default function RoundedText(props: Props) {
  return (
    <span
      style={props.style}
      className={cn(
        variants({
          variant: props.variant,
          weight: props.weight,
          textSize: props.textSize,
          textStyle: props.textStyle,
          padding: props.padding,
          borderRadius: props.borderRadius,
        }),
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}
