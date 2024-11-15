import Analytics from '@/ui/analytics';
import ClicksAdmin from '@/ui/analytics/clicks-admin';
import LayoutLoader from '@/ui/layout/layout-loader';
import { MaxWidthWrapper } from '@dub/ui';
import { Suspense } from 'react';

export default function AdminAnalytics() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <div className="flex flex-col border-b border-gray-200 bg-white py-6">
        <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
          <div className="flex items-center justify-between mx-6">
            <h1 className="truncate text-2xl text-gray-600 font-medium hidden xs:block mr-auto">
              Agency Analytics
            </h1>
          </div>
        </MaxWidthWrapper>
      </div>
      <div className="bg-gray-50">
        <MaxWidthWrapper className="py-10">
          <ClicksAdmin />
          {/* Add other admin-specific analytics components here */}
        </MaxWidthWrapper>
      </div>
    </Suspense>
  );
}
