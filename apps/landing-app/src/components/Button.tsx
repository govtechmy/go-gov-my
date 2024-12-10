import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-start text-sm font-medium active:translate-y-[0.5px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30 lg:text-sm',
  {
    variants: {
      variant: {
        default: '',
        primary:
          'bg-gradient-to-t from-blue-600 to-[#3E7AFF] text-white shadow-button hover:to-[#5B8EFF]',
        secondary:
          'border border-outline-200 bg-background shadow-button hover:border-outline-300 focus:border-outline-200 focus:ring focus:ring-outline-400/20 focus:ring-offset-0',
        'secondary-colour':
          'border border-brand-200 bg-background text-foreground shadow-button hover:border-brand-300 hover:bg-brand-50 focus:border-brand-200 focus:ring focus:ring-brand-600/20 focus:ring-offset-0',
        tertiary: 'hover:bg-washed-100 focus:ring focus:ring-outline-400/20 focus:ring-offset-0',
        'tertiary-colour':
          'text-foreground hover:bg-brand-50 focus:ring focus:ring-brand-600/20 focus:ring-offset-0',
        tertiaryColor: cn(
          'focus:ring-brand-600/40',
          'hover:bg-brand-50 focus:bg-white-force_white',
          'text-brand-600 data-[disabled=true]:text-brand-text_only-disabled'
        ),
      },
      size: {
        default: '',
        sm: 'px-2.5 py-1.5',
        md: 'px-3 py-2',
        lg: 'px-3 py-2.5',
        icon: 'p-2.5',
        large: cn('px-[0.875rem] py-[0.625rem]', 'text-[1rem] leading-[1.5rem]'),
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'sm',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
