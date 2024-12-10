import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
  size: 'parent' | 'medium';
  target?: '_blank' | '_self';
};

const variants = cva(cn('text-brand-600', 'font-medium', 'underline'), {
  variants: {
    size: {
      parent: '',
      medium: 'text-[1rem] leading-[1.5rem]',
    },
  },
});

/**
 * A text component that has a rounded background using the brand color.
 */
export default function BrandLink(props: Props) {
  return (
    <a href={props.href} className={variants({ size: props.size })}>
      {props.children}
    </a>
  );
}
