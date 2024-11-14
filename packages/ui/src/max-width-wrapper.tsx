import { cn } from '@dub/utils';
import { ReactNode } from 'react';

export function MaxWidthWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('mx-auto w-full px-0 md:px-0 lg:px-0 max-w-7xl py-0', className)}>
      {children}
    </div>
  );
}
