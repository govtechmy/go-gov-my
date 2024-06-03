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
    headers()?.get("Request-Source") === "app.dub.co"
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
      response = await prisma.domain.findUnique({
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
    }
    return response[0]["clicks"];
  }

  // ## Issue 6: Since we are not using Tinybird anymore, we need to migrate this pipe logic to ClickHouse
  // const pipe = tb.buildPipe({
  //   pipe: `clicks_${endpoint || "count"}`,
  //   parameters: getClickAnalytics,
  //   data: getClickAnalyticsResponse[endpoint || "count"],
  // });

  // let granularity: "minute" | "hour" | "day" | "month" = "day";

  // if (interval) {
  //   start = INTERVAL_DATA[interval].startDate;
  //   end = new Date(Date.now());
  //   granularity = INTERVAL_DATA[interval].granularity;
  // } else {
  //   start = new Date(start!);
  //   end = end ? new Date(end) : new Date(Date.now());
  //   if (getDaysDifference(start, end) > 180) {
  //     granularity = "month";
  //   }

  //   // swap start and end if start is greater than end
  //   if (start > end) {
  //     [start, end] = [end, start];
  //   }
  // }

  // const res = await pipe(
  //   getClickAnalytics.parse({
  //     ...props,
  //     workspaceId,
  //     start: start.toISOString().replace("T", " ").replace("Z", ""),
  //     end: end.toISOString().replace("T", " ").replace("Z", ""),
  //     granularity,
  //   }),
  // );

  // for total clicks, we return just the value;
  // everything else we return an array of values

  let dummyResponse = [
    { clicks: 10 },
    { clicks: 15 },
    { clicks: 8 },
    { clicks: 20 },
  ];

  return endpoint === "count" ? dummyResponse[0].clicks : dummyResponse;
};
