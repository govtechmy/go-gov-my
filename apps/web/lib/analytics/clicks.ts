import z from '@/lib/zod';
import { headers } from 'next/headers';
import { prisma } from '../prisma';
import { clickAnalyticsQuerySchema } from '../zod/schemas/analytics';
import { INTERVAL_DATA } from './constants';
import { AnalyticFromDBProps, AnalyticsEndpoints, MetadataProps } from './types';

export const getClicks = async (
  props: z.infer<typeof clickAnalyticsQuerySchema> & {
    workspaceId?: string;
    endpoint?: AnalyticsEndpoints;
  }
) => {
  let { workspaceId, endpoint, linkId, interval, start, end, domain, key, tagId } = props;

  // get all-time clicks count if:
  // 1. linkId is defined
  // 2. endpoint is not defined
  // 3. interval is all time
  // 4. call is made from dashboard
  if (
    linkId &&
    endpoint === 'count' &&
    interval === 'all' &&
    headers()?.get('Request-Source') === process.env.NEXT_PUBLIC_APP_DOMAIN
  ) {
    let response = await prisma.link.findUnique({
      where: {
        id: linkId,
      },
      select: {
        clicks: true,
      },
    });

    if (!response) {
      return 0;
    }

    return response[0]['clicks'];
  }

  function sumTwoObj(obj1, obj2) {
    const clone = {};
    for (const key in obj1) {
      if (obj1.hasOwnProperty(key)) {
        clone[key] = obj1[key];
      }
    }
    for (const key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (typeof obj2[key] === 'number') {
          if (clone.hasOwnProperty(key)) {
            clone[key] += obj2[key];
          } else {
            clone[key] = obj2[key];
          }
        } else if (typeof obj2[key] === 'object') {
          clone[key] = sumTwoObj(obj2[key], clone[key]);
        }
      }
    }
    return clone;
  }

  let granularity: 'minute' | 'hour' | 'day' | 'month' | 'custom' = 'day';
  // const startDate: Date | String = new Date().toISOString().split('T')[0]  // fast way to get YYYY-MM-DD
  // const endDate: Date | String = new Date().toISOString().split('T')[0]

  if (start === undefined || start === null) start = new Date(Date.now());
  if (end === undefined || end === null) end = new Date(Date.now());

  start = interval === 'custom' ? start : INTERVAL_DATA[interval].startDate;
  end = interval === 'custom' ? end : new Date(Date.now());
  granularity = INTERVAL_DATA[interval].granularity;

  // swap start and end if start is greater than end
  if (start > end) {
    [start, end] = [end, start];
  }

  // find the links and put it in an array string[]
  const links = await prisma.link.findMany({
    where: {
      projectId: workspaceId,
      ...(domain && { domain }),
      ...(key && { key }),
      ...(tagId && { tags: { some: { tagId } } }),
    },
    select: {
      id: true,
    },
  });
  const linkList = links.map((link) => link.id);
  // find the relevant metadata for the links
  const analytics: AnalyticFromDBProps = await prisma.analytics.findMany({
    where: {
      AND: [
        { linkId: { in: linkList } },
        {
          aggregatedDate: {
            gte: start,
          },
        },
        {
          aggregatedDate: {
            lte: end,
          },
        },
      ],
    },
    orderBy: {
      aggregatedDate: 'asc',
    },
    select: {
      linkId: true,
      aggregatedDate: true,
      metadata: true,
    },
  });

  // for total clicks, we return just the value;
  // everything else we return an array of values
  if (endpoint === 'count') {
    const totalCount = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (metadata?.total && !isNaN(metadata?.total)) return (accumulator += metadata?.total);
      return accumulator;
    }, 0);
    return totalCount;
  }

  if (endpoint === 'countries') {
    const countries = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (metadata?.countryCode) return sumTwoObj(accumulator, metadata?.countryCode);
      return accumulator;
    }, {});
    return Object.keys(countries)
      .map((key) => {
        return { country: key, clicks: countries[key] };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'cities') {
    const cities = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (metadata.city) return sumTwoObj(accumulator, metadata?.city);
      return accumulator;
    }, {});
    return Object.keys(cities)
      .map((key) => {
        const [country, city] = key.split(':');
        return { country, city, clicks: cities[key] };
      })
      .filter(({ country, city }) => country?.length > 0 && city?.length > 0)
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'top_links') {
    if (!workspaceId) {
      throw Error("failed to get top links, missing 'workspaceId'");
    }
    const top_links = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (!isNaN(metadata?.total) && row?.linkId in accumulator) {
        accumulator[row?.linkId] += metadata?.total;
        return accumulator;
      }
      accumulator[row?.linkId] = metadata?.total || 0;
      return accumulator;
    }, {});

    return Object.keys(top_links)
      .map((key) => {
        return { link: key, clicks: top_links[key] };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'top_urls') {
    const top_urls = analytics.reduce<Record<string, number>>((accumulator, row) => {
      const metadata = row.metadata as MetadataProps;
      if ('linkUrl' in metadata) return sumTwoObj(accumulator, metadata['linkUrl']);
      return accumulator;
    }, {});
    return Object.entries(top_urls)
      .map(([url, clicks]) => ({ url, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'referers') {
    const referers = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (metadata?.referer) return sumTwoObj(accumulator, metadata?.referer);
      return accumulator;
    }, {});
    return Object.keys(referers)
      .map((key) => {
        return { referer: key, clicks: referers[key] };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'devices') {
    const devices = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (metadata?.deviceType) return sumTwoObj(accumulator, metadata?.deviceType);
      return accumulator;
    }, {});
    return Object.keys(devices)
      .map((key) => {
        return { device: key, clicks: devices[key] };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'browsers') {
    const browsers = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (metadata?.browser) return sumTwoObj(accumulator, metadata?.browser);
      return accumulator;
    }, {});
    return Object.keys(browsers)
      .map((key) => {
        return { browser: key, clicks: browsers[key] };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'os') {
    const os = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (metadata?.operatingSystem) return sumTwoObj(accumulator, metadata?.operatingSystem);
      return accumulator;
    }, {});
    return Object.keys(os)
      .map((key) => {
        return { os: key, clicks: os[key] };
      })
      .sort((a, b) => b.clicks - a.clicks);
  }

  if (endpoint === 'timeseries') {
    const timeseries = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata as MetadataProps;
      if (row?.aggregatedDate.toString() in accumulator) {
        accumulator[row?.aggregatedDate.toString()] += metadata?.total;
        return accumulator;
      }
      accumulator[row?.aggregatedDate.toString()] = metadata?.total;
      return accumulator;
    }, {});
    if (JSON.stringify(timeseries) === '{}') return [{ start: new Date(), clicks: 0 }];
    return Object.keys(timeseries).map((key) => {
      return { start: key, clicks: timeseries[key] };
    });
  }

  if (endpoint === 'asn') {
    console.log('analytics', analytics);
    const asnData = analytics.flatMap((entry) => {
      const metadata = entry.metadata as {
        asn?: Array<{ asn: string; organization: string; clicks: number }>;
      };
      return metadata.asn || [];
    });

    // Aggregate ASN data
    const aggregatedAsnData = asnData.reduce<
      Record<string, { asn: string; organization: string; clicks: number }>
    >((acc, curr) => {
      const key = `${curr.asn} - ${curr.organization}`;
      if (acc[key]) {
        acc[key].clicks += curr.clicks;
      } else {
        acc[key] = { ...curr };
      }
      return acc;
    }, {});

    const sortedAsnData = Object.values(aggregatedAsnData).sort((a, b) => b.clicks - a.clicks);

    return sortedAsnData;
  }

  // return no data for other endpoints for now
  return [];
};
