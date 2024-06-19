import z from "@/lib/zod";
import { headers } from "next/headers";
import { prisma } from "../prisma";
import { clickAnalyticsQuerySchema } from "../zod/schemas/analytics";
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

  // for total clicks, we return just the value;
  // everything else we return an array of values
  if (endpoint === "count") {
    return 230;
  }

  if (endpoint === "countries") {
    return [
      { country: "MY", clicks: 100 },
      { country: "ID", clicks: 50 },
      { country: "SG", clicks: 40 },
      { country: "TH", clicks: 20 },
      { country: "VN", clicks: 10 },
      { country: "PH", clicks: 10 },
    ];
  }

  if (endpoint === "top_links") {
    if (!workspaceId) {
      throw Error("failed to get top links, missing 'workspaceId'");
    }
    const links = await prisma.link.findMany({
      where: { projectId: workspaceId.replace("ws_", "") },
      orderBy: { clicks: "desc" },
    });

    return links.map((link) => ({
      link: link.id,
      clicks: link.clicks,
    }));
  }

  if (endpoint === "referers") {
    return [
      { referer: "(direct)", clicks: 100 },
      { referer: "facebook.com", clicks: 80 },
      { referer: "x.com", clicks: 50 },
    ];
  }

  if (endpoint === "devices") {
    return [
      { device: "Mobile", clicks: 200 },
      { device: "Desktop", clicks: 30 },
    ];
  }

  if (endpoint === "browsers") {
    return [
      { browser: "Chrome", clicks: 150 },
      { browser: "Edge", clicks: 50 },
      { browser: "Firefox", clicks: 30 },
    ];
  }

  if (endpoint === "os") {
    return [
      { os: "Android", clicks: 150 },
      { os: "iOS", clicks: 50 },
      { os: "Linux", clicks: 30 },
    ];
  }

  if (endpoint === "timeseries") {
    return [
      { start: dateNHoursFromNow(0), clicks: 10 },
      { start: dateNHoursFromNow(1), clicks: 15 },
      { start: dateNHoursFromNow(2), clicks: 8 },
      { start: dateNHoursFromNow(3), clicks: 20 },
    ];
  }

  // return no data for other endpoints for now
  return [];
};

/**
 * Generate dummy date.
 */
function dateNHoursFromNow(n: number) {
  const date = new Date();
  date.setHours(date.getHours() + n);
  return date;
}
