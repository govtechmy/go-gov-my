'use client';
import { VALID_ANALYTICS_FILTERS } from '@/lib/analytics/constants';
import useWorkspace from '@/lib/swr/use-workspace';
import { fetcher } from '@dub/utils';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { createContext, useMemo } from 'react';
import useSWR from 'swr';
import Clicks from './clicks';
import Devices from './devices';
import Locations from './locations';
import Referer from './referer';
import Toggle from './toggle';
import TopLinks from './top-links';

export const AnalyticsContext = createContext<{
  basePath: string;
  baseApiPath: string;
  domain?: string;
  key?: string;
  url?: string;
  queryString: string;
  interval: string;
  tagId?: string;
  totalClicks?: number;
  admin?: boolean;
  start: string;
  end: string;
  workspaceId: string | undefined;
  link: string;
}>({
  basePath: '',
  baseApiPath: '',
  domain: '',
  queryString: '',
  interval: '',
  admin: false,
  start: '',
  end: '',
  workspaceId: '',
  link: '',
});

export default function Analytics({
  staticDomain,
  staticUrl,
  admin,
  actions,
}: {
  staticDomain?: string;
  staticUrl?: string;
  admin?: boolean;
  actions?: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { id, slug } = useWorkspace();

  let { key } = useParams() as {
    key?: string;
  };
  // key can be a path param (public stats pages) or a query param (stats pages in app)
  key = searchParams?.get('key') || key;

  const domainSlug = searchParams?.get('domain');
  const interval = searchParams?.get('interval') || '30d';

  const start = searchParams?.get('start') || '';
  const end = searchParams?.get('end') || '';

  const tagId = searchParams?.get('tagId') ?? undefined;
  const link = searchParams?.get('link') || '';

  const { basePath, domain, baseApiPath } = useMemo(() => {
    // Workspace analytics page, e.g. app.go.gov.my/{workspaceId}/analytics?domain=dub.sh&key=github
    if (admin) {
      return {
        basePath: `/analytics`,
        baseApiPath: `/api/analytics/admin/clicks`,
        domain: domainSlug,
      };
    } else if (slug) {
      return {
        basePath: `/${slug}/analytics`,
        baseApiPath: `/api/analytics/clicks`,
        domain: domainSlug,
      };
    } else {
      // Public stats page, e.g. dub.co/stats/github, stey.me/stats/weathergpt
      return {
        basePath: `/stats/${key}`,
        baseApiPath: '/api/analytics/edge/clicks',
        domain: staticDomain,
      };
    }
  }, [admin, slug, pathname, staticDomain, domainSlug, key]);

  const queryString = useMemo(() => {
    const availableFilterParams = VALID_ANALYTICS_FILTERS.reduce(
      (acc, filter) => ({
        ...acc,
        ...(searchParams?.get(filter) && {
          [filter]: searchParams.get(filter),
        }),
      }),
      {}
    );
    return new URLSearchParams({
      ...(id && { workspaceId: id }),
      ...(domain && { domain }),
      ...(key && { key }),
      ...(interval && { interval }),
      ...(start && { start }),
      ...(end && { end }),
      ...(link && { link }),
      ...(tagId && { tagId }),
      ...availableFilterParams,
    }).toString();
  }, [id, domain, key, searchParams, interval, tagId, link]);

  const { data: totalClicks } = useSWR<number>(`${baseApiPath}/count?${queryString}`, fetcher);

  const isPublicStatsPage = basePath.startsWith('/stats');

  return (
    <AnalyticsContext.Provider
      value={{
        basePath, // basePath for the page (e.g. /stats/[key], /[slug]/analytics)
        baseApiPath, // baseApiPath for the API (e.g. /api/analytics)
        queryString,
        domain: domain || undefined, // domain for the link (e.g. dub.sh, stey.me, etc.)
        key: key ? decodeURIComponent(key) : undefined, // link key (e.g. github, weathergpt, etc.)
        url: staticUrl, // url for the link (only for public stats pages)
        interval, // time interval (e.g. 24h, 7d, 30d, etc.)
        tagId, // id of a single tag
        totalClicks, // total clicks for the link
        admin, // whether the user is an admin
        start, // start date if interval is custom
        end, // end date if interval is custom
        workspaceId: id,
        link,
      }}
    >
      <div className="bg-gray-50">
        <Toggle actions={actions} />
        <div className="mx-auto grid max-w-7xl gap-5 px-2">
          <Clicks />
          {/* <CountryChart /> */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Locations />
            {!isPublicStatsPage && <TopLinks />}
            <Devices />
            <Referer />
            {isPublicStatsPage && <TopLinks />}
            {/* <Feedback /> */}
          </div>
        </div>
      </div>
    </AnalyticsContext.Provider>
  );
}
