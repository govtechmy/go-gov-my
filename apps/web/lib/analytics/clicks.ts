import z from "@/lib/zod";
import { headers } from "next/headers";
import { prisma } from "../prisma";
import { clickAnalyticsQuerySchema } from "../zod/schemas/analytics";
import { INTERVAL_DATA } from "./constants";
import { AnalyticsEndpoints } from "./types";

export const getClicks = async (
  props: z.infer<typeof clickAnalyticsQuerySchema> & {
    workspaceId?: string;
    endpoint?: AnalyticsEndpoints;
  },
) => {
  let { workspaceId, endpoint, linkId, interval, start, end } = props;

  // get all-time clicks count if:
  // 1. linkId is defined
  // 2. endpoint is not defined
  // 3. interval is all time
  // 4. call is made from dashboard
  if (
    linkId &&
    endpoint === "count" &&
    interval === "all" &&
    headers()?.get("Request-Source") === process.env.NEXT_PUBLIC_APP_DOMAIN
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

    return response[0]["clicks"];
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
        if (typeof obj2[key] === "number") {
          if (clone.hasOwnProperty(key)) {
            clone[key] += obj2[key];
          } else {
            clone[key] = obj2[key];
          }
        } else if (typeof obj2[key] === "object") {
          clone[key] = sumTwoObj(obj2[key], clone[key]);
        }
      }
    }
    return clone;
  }

  let granularity: "minute" | "hour" | "day" | "month" = "day";
  // const startDate: Date | String = new Date().toISOString().split('T')[0]  // fast way to get YYYY-MM-DD
  // const endDate: Date | String = new Date().toISOString().split('T')[0]

  if (interval === "24h") {
    start = new Date();
    end = new Date();
  } else {
    start = INTERVAL_DATA[interval].startDate;
    end = new Date(Date.now());
    granularity = INTERVAL_DATA[interval].granularity;
  }

  // swap start and end if start is greater than end
  if (start > end) {
    [start, end] = [end, start];
  }

  // find the links and put it in an array string[]
  const links = await prisma.link.findMany({
    where: {
      projectId: workspaceId,
    },
    select: {
      id: true,
    },
  });
  const linkList = links.map((link) => link.id);
  // find the relevant metadata for the links
  const analytics = await prisma.analytics.findMany({
    where: {
      AND: [
        { linkId: { in: linkList } },
        {
          shortDate: {
            gte: start,
          },
        },
        {
          shortDate: {
            lte: end,
          },
        },
      ],
    },
    select: {
      linkId: true,
      shortDate: true,
      metadata: true,
    },
  });

  // for total clicks, we return just the value;
  // everything else we return an array of values
  if (endpoint === "count") {
    const totalCount = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (metadata?.total && !isNaN(metadata?.total))
        return (accumulator += metadata?.total);
      return accumulator;
    }, 0);
    return totalCount;
  }

  if (endpoint === "countries") {
    const countries = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (metadata?.countryCode)
        return sumTwoObj(accumulator, metadata?.countryCode);
      return accumulator;
    }, {});
    return Object.keys(countries).map((key) => {
      return { country: key, clicks: countries[key] };
    });
  }

  if (endpoint === "top_links") {
    if (!workspaceId) {
      throw Error("failed to get top links, missing 'workspaceId'");
    }
    const top_links = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (!isNaN(metadata?.total) && row?.linkId in accumulator) {
        accumulator[row?.linkId] += metadata?.total;
        return accumulator;
      }
      accumulator[row?.linkId] = metadata?.total || 0;
      return accumulator;
    }, {});

    return Object.keys(top_links).map((key) => {
      return { link: key, clicks: top_links[key] };
    });
  }

  if (endpoint === "referers") {
    const referers = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (metadata?.referer) return sumTwoObj(accumulator, metadata?.referer);
      return accumulator;
    }, {});
    return Object.keys(referers).map((key) => {
      return { referer: key, clicks: referers[key] };
    });
  }

  if (endpoint === "devices") {
    const devices = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (metadata?.deviceType)
        return sumTwoObj(accumulator, metadata?.deviceType);
      return accumulator;
    }, {});
    return Object.keys(devices).map((key) => {
      return { device: key.toUpperCase(), clicks: devices[key] };
    });
  }

  if (endpoint === "browsers") {
    const browsers = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (metadata?.browser) return sumTwoObj(accumulator, metadata?.browser);
      return accumulator;
    }, {});
    return Object.keys(browsers).map((key) => {
      return { browser: key, clicks: browsers[key] };
    });
  }

  if (endpoint === "os") {
    const os = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (metadata?.operatingSystem)
        return sumTwoObj(accumulator, metadata?.operatingSystem);
      return accumulator;
    }, {});
    return Object.keys(os).map((key) => {
      return { os: key, clicks: os[key] };
    });
  }

  if (endpoint === "timeseries") {
    const timeseries = analytics.reduce((accumulator, row) => {
      const metadata = row?.metadata;
      if (row?.shortDate in accumulator) {
        accumulator[row?.shortDate] += metadata?.total;
        return accumulator;
      }
      accumulator[row?.shortDate] = metadata?.total;
      return accumulator;
    }, {});
    return Object.keys(timeseries).map((key) => {
      return { start: key, clicks: timeseries[key] };
    });
  }

  // return no data for other endpoints for now
  return [];
};
