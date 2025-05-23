import { VALID_ANALYTICS_FILTERS } from '@/lib/analytics/constants';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useTags from '@/lib/swr/use-tags';
import { Chart } from '@/ui/shared/icons';
import { CountingNumbers, NumberTooltip, useRouterStuff } from '@dub/ui';
import { COUNTRIES, capitalize, linkConstructor, truncate } from '@dub/utils';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useContext } from 'react';
import { AnalyticsContext } from '.';
import GeoChart from '../charts/google-charts';

export default function CountryChart() {
  const { totalClicks } = useContext(AnalyticsContext);
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain');
  const key = searchParams.get('key');
  const { queryParams } = useRouterStuff();
  const { messages, locale } = useIntlClientHook();
  const message = messages?.analytics;

  // Tag related
  const tagId = searchParams.get('tagId');
  const { tags } = useTags();

  // Root domain related
  const root = searchParams.get('root');

  // Transform analytics data for country chart
  const analyticsData = {
    total: 23,
    linkSlug: { RXB1Anr: 23 },
    linkUrl: { 'https://google.com/': 23 },
    countryCode: { US: 8, MY: 11, SE: 2, EG: 2 },
    city: {
      'MY:Petaling Jaya': 2,
      'US:Columbus': 1,
      'US:Las Vegas': 1,
      'SE:Gothenburg': 2,
      'EG:Cairo': 2,
      'MY:Puchong Batu Dua Belas': 1,
      'US:Ashburn': 1,
      'MY:Kuala Lumpur': 8,
    },
    deviceType: { mobile: 9, desktop: 9 },
    browser: {
      Chrome: 8,
      Safari: 5,
      Edge: 3,
      Firefox: 2,
      'Slackbot-LinkExpanding 1.0': 1,
      WhatsApp: 4,
    },
    operatingSystem: { iOS: 7, Android: 2, Linux: 2, Windows: 4, macOS: 3 },
    referer: { 'http://pautan.org': 4 },
  };
  const transformAnalyticsData = (analyticsData) => {
    const transformedData = [['Country', 'Clicks']];
    Object.entries(analyticsData.countryCode).forEach(([countryCode, clicks]) => {
      const countryName = COUNTRIES[countryCode as string] || (countryCode as any);
      transformedData.push([countryName, clicks]);
    });
    return transformedData;
  };

  const countryChartData = transformAnalyticsData(analyticsData);

  return (
    <div className="max-w-4xl overflow-hidden border border-gray-200 bg-white p-5 sm:rounded-lg sm:border-gray-100 sm:p-10 sm:shadow-lg">
      <div className="mb-5 flex items-start justify-between space-x-4">
        <div className="flex-none">
          <div className="flex items-end space-x-1">
            {totalClicks || totalClicks === 0 ? (
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
            {message?.total_clicks} BY COUNTRY <br />
            <strong className="text-red-600">(DUMMY DATA)</strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {domain &&
            (key ? (
              <Link
                href={
                  queryParams({
                    del: ['domain', 'key'],
                    getNewPath: true,
                  }) as string
                }
                className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 transition-all hover:bg-gray-100"
              >
                <p>{message?.link}</p>
                <strong className="text-gray-800">
                  {truncate(linkConstructor({ domain, key, pretty: true }), 24)}
                </strong>
                <X className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href={
                  queryParams({
                    del: 'domain',
                    getNewPath: true,
                  }) as string
                }
                className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 transition-all hover:bg-gray-100"
              >
                <p>{message?.domain}</p>
                <strong className="text-gray-800">{domain}</strong>
                <X className="h-4 w-4" />
              </Link>
            ))}
          {tags && tagId && (
            <Link
              href={
                queryParams({
                  del: 'tagId',
                  getNewPath: true,
                }) as string
              }
              className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 transition-all hover:bg-gray-100"
            >
              <p>Tag</p>
              <strong className="text-gray-800">
                {tags.find((tag) => tag.id === tagId)?.name || tagId}
              </strong>
              <X className="h-4 w-4" />
            </Link>
          )}
          {root && (
            <Link
              href={
                queryParams({
                  del: 'root',
                  getNewPath: true,
                }) as string
              }
              className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 transition-all hover:bg-gray-100"
            >
              <strong className="text-gray-800">{root === 'true' ? 'Domains' : 'Links'}</strong>
              <p>{message?.only}</p>
              <X className="h-4 w-4" />
            </Link>
          )}
          {VALID_ANALYTICS_FILTERS.map((filter) => {
            if (filter === 'tagId' || filter === 'qr' || filter === 'root') return null;
            const value = searchParams?.get(filter);
            if (!value) return null;
            return (
              <Link
                key={filter}
                href={
                  queryParams({
                    del: filter,
                    getNewPath: true,
                  }) as string
                }
                className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 transition-all hover:bg-gray-100"
              >
                <p>{capitalize(filter)}</p>
                <strong className="text-gray-800">
                  {filter === 'country' ? COUNTRIES[value] : truncate(value, 24)}
                </strong>
                <X className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
      </div>
      <div className="relative h-96 w-full">
        <GeoChart data={countryChartData} />
      </div>
    </div>
  );
}
