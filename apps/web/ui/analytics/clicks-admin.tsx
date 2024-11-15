'use client';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Chart } from '@/ui/shared/icons';
import { CountingNumbers, NumberTooltip } from '@dub/ui';
import { useMemo } from 'react';
import ClicksChart from './clicks-chart';
import useSWR from 'swr';
import { fetcher } from '@dub/utils';
import { AnalyticsContext } from '.';
import { useSession } from 'next-auth/react';
import PageTitle from '../typography/page-title';

export default function ClicksAdmin() {
  const { messages } = useIntlClientHook();
  const { data: session, status } = useSession();
  const message = messages?.analytics;

  // Only fetch when session is loaded and we have a userId
  const shouldFetch = status === 'authenticated' && session?.user?.id;

  // Fetch analytics data from new endpoint
  const { data: analyticsData, isLoading } = useSWR(
    shouldFetch ? `/api/admin/analytic-clicks` : null, // Only fetch if shouldFetch is true
    (url) =>
      fetcher(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
        }),
      })
  );

  // Calculate total clicks, handling empty data
  const totalClicks = useMemo(() => {
    if (!analyticsData || analyticsData.length === 0) return 0;
    return analyticsData.reduce((acc: number, item: any) => acc + item.clicks, 0);
  }, [analyticsData]);

  // Create context value for ClicksChart
  const contextValue = useMemo(
    () => ({
      basePath: '/admin/analytics',
      baseApiPath: '/api/admin/analytic-clicks',
      queryString: shouldFetch ? `userId=${session?.user?.id}` : '', // Only add userId when session is loaded
      interval: '30d',
      totalClicks,
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    }),
    [totalClicks, session?.user?.id, shouldFetch]
  );

  // Show loading state while session is loading
  if (status === 'loading') {
    return <div className="h-10 w-12 animate-pulse rounded-md bg-gray-200" />;
  }

  return (
    <>
      <div className="max-w-7xl overflow-hidden border border-gray-200 bg-white p-5 sm:rounded-lg sm:border-gray-100 sm:p-10 sm:shadow-lg my-5">
        <PageTitle text={messages?.dashboard?.analytics} />
        <div className="my-5 flex items-start justify-between space-x-4">
          <div className="flex-none">
            <div className="flex items-end space-x-1">
              {!isLoading ? (
                <NumberTooltip value={totalClicks}>
                  <CountingNumbers as="h1" className="text-3xl font-bold sm:text-4xl">
                    {totalClicks}
                  </CountingNumbers>
                </NumberTooltip>
              ) : (
                <div className="h-10 w-12 animate-pulse rounded-md bg-gray-200" />
              )}
              <Chart className="mb-1 h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm font-medium uppercase text-gray-600">
              Total Clicks for this Agency
            </p>
          </div>
        </div>

        <AnalyticsContext.Provider value={contextValue}>
          <ClicksChart />
        </AnalyticsContext.Provider>
      </div>
    </>
  );
}
