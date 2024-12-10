import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

type Props = {
  disabled?: boolean;
  type: 'password' | 'text';
  size?: 'small' | 'large';
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (text: string) => void;
  className?: string;
};

const variants = cva(
  cn(
    'shadow-[0px_1px_3px_0px_rgba(0,0,0,0.07)]',
    'rounded-[0.5rem]',
    'outline-none',
    'border border-gray-outline-200 ',
    'w-full',
    'py-[0.5rem] px-[0.75rem]',
    'placeholder:text-gray-dim-500',
    'text-[1rem] leading-[1.5rem]',
    'text-black-900',
    'focus:border focus:border-brand-300',
    'focus:ring-[0.1875rem] focus:ring-brand-600/0.2',
    'disabled:bg-gray-washed-100',
    'disabled:text-gray-dim-500',
    'disabled:cursor-not-allowed',
  ),
  {
    variants: {
      size: {
        small: cn('py-[0.375rem] px-[0.625rem]', 'text-[0.875rem] leading-[1.25rem]'),
        large: cn('py-[0.625rem] px-[0.875rem]', 'text-[1rem] leading-[1.5rem]'),
      },
    },
  },
);

export default function Input(props: Props) {
  return (
    <input
      disabled={props.disabled}
      type={props.type}
      placeholder={props.placeholder}
      name={props.name}
      value={props.value}
      onChange={(e) => props.onChange?.(e.target.value)}
      className={cn(
        variants({
          size: props.size,
        }),
        props.className,
      )}
    ></input>
  );
}
