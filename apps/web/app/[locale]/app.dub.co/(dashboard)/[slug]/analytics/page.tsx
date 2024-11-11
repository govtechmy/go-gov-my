import Analytics from '@/ui/analytics';
import LayoutLoader from '@/ui/layout/layout-loader';
import { Suspense } from 'react';
import AnalyticsClient from './client';
import { MaxWidthWrapper } from '@dub/ui';
import NavTabs from '@/ui/layout/nav-tabs';

export default function WorkspaceAnalytics() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <div className="flex flex-col border-b border-gray-200 bg-white py-6">
        <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
          <div className="flex items-center justify-between mx-6">
            <h1 className="truncate text-2xl text-gray-600 font-medium hidden xs:block mr-auto">
              Analytics
            </h1>
          </div>
        </MaxWidthWrapper>
        <div className="w-full flex justify-center">
          <NavTabs />
        </div>
      </div>
      <AnalyticsClient>
        <Analytics />
      </AnalyticsClient>
    </Suspense>
  );
}
