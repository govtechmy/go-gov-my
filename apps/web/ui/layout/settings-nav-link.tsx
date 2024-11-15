'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { cn } from '@dub/utils';
import Link from 'next/link';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { ReactNode } from 'react';

export default function NavLink({
  segment,
  children,
}: {
  segment: string | null;
  children: ReactNode;
}) {
  const selectedLayoutSegment = useSelectedLayoutSegment();
  const { slug } = useParams() as {
    slug?: string;
  };
  const { locale } = useIntlClientHook();

  const href = `${slug ? `/${locale}/${slug}` : `/${locale}`}/settings${
    segment ? `/${segment}` : ''
  }`;

  return (
    <Link
      key={href}
      href={href}
      className={cn(
        'rounded-md p-2.5 hover:text-blue-700 text-sm transition-all duration-75 hover:bg-blue-100 active:bg-blue-200',
        {
          'font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 active:bg-blue-300':
            selectedLayoutSegment === segment,
        }
      )}
    >
      {children}
    </Link>
  );
}
