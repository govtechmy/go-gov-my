import { z } from "zod";

const ClicksRecord = z.record(z.string(), z.number());

const ASNInfo = z.object({
  asn: z.string(),
  organization: z.string(),
  clicks: z.number(),
});

export const AnalyticsMessageSchema = z.object({
  aggregatedDate: z
    .string()
    .describe("A short date in the format of YYYY-MM-DD"),
  from: z.coerce.date(),
  to: z.coerce.date(),
  linkAnalytics: z.array(
    z.object({
      linkId: z.string(),
      total: z.number(),
      linkSlug: ClicksRecord,
      linkUrl: ClicksRecord,
      countryCode: ClicksRecord,
      city: ClicksRecord,
      deviceType: ClicksRecord,
      browser: ClicksRecord,
      operatingSystem: ClicksRecord,
      referer: ClicksRecord,
      asn: z.array(ASNInfo),
    }),
  ),
});

export type AnalyticsMessage = z.infer<typeof AnalyticsMessageSchema>;
