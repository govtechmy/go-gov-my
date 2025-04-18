import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LoadingSpinner } from '@dub/ui';
import { fetcher, nFormatter } from '@dub/utils';
import { useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import Areas from '../charts/areas';
import TimeSeriesChart from '../charts/time-series-chart';
import XAxis from '../charts/x-axis';
import YAxis from '../charts/y-axis';

export default function ClicksChart() {
  const { baseApiPath, queryString, interval } = useContext(AnalyticsContext);

  const { data } = useSWR<{ start: Date; clicks: number }[]>(
    `${baseApiPath}/timeseries?${queryString}`,
    fetcher
  );

  const { messages } = useIntlClientHook();

  const chartData = useMemo(
    () =>
      data?.map(({ start, clicks }) => ({
        date: new Date(start),
        values: { clicks },
      })) ?? null,
    [data]
  );

  const formatDate = useCallback(
    (date: Date) => {
      switch (interval) {
        case '1h':
        case '24h':
          return date.toLocaleTimeString('en-GB', {
            hour: 'numeric',
            minute: 'numeric',
          });
        case '1y':
        case 'all':
          return date.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
            year: '2-digit',
          });
        default:
          return date.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
          });
      }
    },
    [interval]
  );

  return (
    <div className="flex h-96 w-full items-center justify-center">
      {chartData ? (
        <TimeSeriesChart
          key={queryString}
          data={chartData}
          series={[{ id: 'clicks', valueAccessor: (d) => d.values.clicks }]}
          tooltipContent={(d) => (
            <>
              <p className="text-gray-700">
                <strong className="text-gray-800">
                  {nFormatter(d.values.clicks, { full: true })}
                </strong>{' '}
                {messages?.workspace.click}
              </p>
              <p className="text-sm text-gray-500">{formatDate(d.date)}</p>
            </>
          )}
        >
          <Areas />
          <XAxis tickFormat={formatDate} />
          <YAxis showGridLines tickFormat={nFormatter} />
        </TimeSeriesChart>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
}
