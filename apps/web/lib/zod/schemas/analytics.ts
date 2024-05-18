import {
  intervals,
  VALID_ANALYTICS_ENDPOINTS,
} from "@/lib/analytics/constants";
import { formatAnalyticsEndpoint } from "@/lib/analytics/utils";
import z from "@/lib/zod";
import { COUNTRY_CODES } from "@dub/utils";
import { booleanQuerySchema } from "./misc";
import { parseDateSchema } from "./utils";

export const analyticsEndpointSchema = z.object({
  endpoint: z
    .enum(VALID_ANALYTICS_ENDPOINTS, {
      errorMap: (_issue, _ctx) => {
        return {
          message: `Invalid endpoint value. Valid endpoints are: ${VALID_ANALYTICS_ENDPOINTS.join(", ")}`,
        };
      },
    })
    .transform((v) => formatAnalyticsEndpoint(v, "plural"))
    .optional()
    .describe(
      "The field to group the analytics by. If undefined, returns the total click count.",
    ),
});

export const clickAnalyticsQuerySchema = z.object({
  domain: z.string().optional().describe("The domain to filter analytics for."),
  key: z.string().optional().describe("The short link slug."),
  linkId: z
    .string()
    .optional()
    .describe("The unique ID of the short link on Dub."),
  externalId: z
    .string()
    .optional()
    .describe(
      "This is the ID of the link in the your database. Must be prefixed with 'ext_' when passed as a query parameter.",
    ),
  interval: z
    .enum(intervals)
    .optional()
    .default("24h")
    .describe(
      "The interval to retrieve analytics for. Takes precedence over start and end. If undefined, defaults to 24h.",
    ),
  start: parseDateSchema
    .refine(
      (value: Date) => {
        const foundingDate = new Date("2022-09-22T00:00:00.000Z"); // Dub.co founding date
        return value >= foundingDate;
      },
      {
        message: "The start date cannot be earlier than September 22, 2022.",
      },
    )
    .optional()
    .describe("The start date and time when to retrieve analytics from."),
  end: parseDateSchema
    .refine(
      (value: Date) => {
        const todaysDate = new Date();
        return value <= todaysDate;
      },
      {
        message: "The end date cannot be in future.",
      },
    )
    .optional()
    .describe(
      "The end date and time when to retrieve analytics from. If not provided, defaults to the current date.",
    ),
  country: z
    .enum(COUNTRY_CODES)
    .optional()
    .describe("The country to retrieve analytics for.")
    .openapi({ ref: "countryCode" }),
  city: z.string().optional().describe("The city to retrieve analytics for."),
  device: z
    .string()
    .optional()
    .describe("The device to retrieve analytics for."),
  browser: z
    .string()
    .optional()
    .describe("The browser to retrieve analytics for."),
  os: z.string().optional().describe("The OS to retrieve analytics for."),
  referer: z
    .string()
    .optional()
    .describe("The referer to retrieve analytics for."),
  url: z.string().optional().describe("The URL to retrieve analytics for."),
  tagId: z
    .string()
    .optional()
    .describe("The tag ID to retrieve analytics for."),
  qr: booleanQuerySchema
    .optional()
    .describe(
      "Filter for QR code scans. If true, filter for QR codes only. If false, filter for links only. If undefined, return both.",
    ),
  root: booleanQuerySchema
    .optional()
    .describe(
      "Filter for root domains. If true, filter for domains only. If false, filter for links only. If undefined, return both.",
    ),
});

export const getClickAnalytics = clickAnalyticsQuerySchema
  .omit({
    groupBy: true,
    interval: true,
    externalId: true,
    key: true,
    start: true,
    end: true,
    root: true,
    qr: true,
  })
  .extend({
    workspaceId: z
      .string()
      .optional()
      .transform((v) => {
        if (v && !v.startsWith("ws_")) {
          return `ws_${v}`;
        } else {
          return v;
        }
      }),
    root: z.boolean().optional(),
    qr: z.boolean().optional(),
    start: z.string(),
    end: z.string(),
    granularity: z.enum(["minute", "hour", "day", "month"]).optional(),
  });

// Analytics response schemas
export const getClickAnalyticsResponse = {
  count: z.object({
    clicks: z.number().describe("The total number of clicks"),
  }),
  timeseries: z.object({
    start: z.string().describe("The starting timestamp of the interval"),
    clicks: z.number().describe("The number of clicks in the interval"),
  }),
  countries: z
    .object({
      country: z
        .enum(COUNTRY_CODES)
        .describe("The 2-letter country code: https://d.to/geo"),
      clicks: z.number().describe("The number of clicks from this country"),
    })
    .openapi({ ref: "clicksByCountry" }),
  cities: z
    .object({
      city: z.string().describe("The name of the city"),
      country: z
        .enum(COUNTRY_CODES)
        .describe("The 2-letter country code of the city: https://d.to/geo"),
      clicks: z.number().describe("The number of clicks from this city"),
    })
    .openapi({ ref: "clicksByCities" }),
  devices: z.object({
    device: z.string().describe("The name of the device"),
    clicks: z.number().describe("The number of clicks from this device"),
  }),
  browsers: z.object({
    browser: z.string().describe("The name of the browser"),
    clicks: z.number().describe("The number of clicks from this browser"),
  }),
  os: z.object({
    os: z.string().describe("The name of the OS"),
    clicks: z.number().describe("The number of clicks from this OS"),
  }),
  referers: z.object({
    referer: z
      .string()
      .describe("The name of the referer. If unknown, this will be `(direct)`"),
    clicks: z.number().describe("The number of clicks from this referer"),
  }),
  top_links: z.object({
    link: z.string().describe("The unique ID of the short link"),
    clicks: z.number().describe("The number of clicks from this link"),
  }),
  top_urls: z.object({
    url: z.string().describe("The destination URL"),
    clicks: z.number().describe("The number of clicks from this URL"),
  }),
} as const;
