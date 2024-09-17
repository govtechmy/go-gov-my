import { JsonValue } from "@prisma/client/runtime/library";
import { intervals } from "./constants";

export type IntervalProps = (typeof intervals)[number];
export type AnalyticsEndpoints =
  | "count"
  | "timeseries"
  | "countries"
  | "cities"
  | "devices"
  | "browsers"
  | "os"
  | "referers"
  | "top_links"
  | "top_urls";
export type LocationTabs = "countries" | "cities" | "asn";
export type TopLinksTabs = "link" | "url";
export type DeviceTabs = "devices" | "browsers" | "os";

export type ObjectProps = {
  [key: string]: number | ObjectProps;
};

export type MetadataProps = {
  total: number;
  [key: string]: number | ObjectProps;
};

export type AnalyticProps = {
  linkId: String;
  aggregatedDate: Date;
  metadata: MetadataProps;
};

export type AnalyticFromDBProps = {
  linkId: string;
  aggregatedDate: Date;
  metadata: JsonValue;
}[];
