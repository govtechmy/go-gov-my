'use client';

import useWorkspace from '@/lib/swr/use-workspace';
import LayoutLoader from '@/ui/layout/layout-loader';
import LinkNotFound from '@/ui/links/link-not-found';
import { SHORT_DOMAIN } from '@dub/utils';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

export default function AnalyticsClient({ children }: { children: ReactNode }) {
  const { exceededClicks, loading } = useWorkspace();
  const searchParams = useSearchParams();
  const domain = searchParams?.get('domain');

  if (loading) {
    return <LayoutLoader />;
  }

  //  GoGovMy does not support custom domains, the 'domain' searchParam must always be equal to SHORT_DOMAIN
  if (domain && domain !== SHORT_DOMAIN) {
    return <LinkNotFound />;
  }

  return children;
}
