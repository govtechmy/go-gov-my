import { prisma } from "@/lib/prisma";
import { LinkProps } from "@/lib/types";

export type LinkHistory = Pick<
  LinkProps,
  // Only pick these fields to store as history
  | "android"
  | "archived"
  | "description"
  | "domain"
  | "expiredUrl"
  | "expiresAt"
  | "externalId"
  | "geo"
  | "image"
  | "ios"
  | "key"
  | "proxy"
  | "publicStats"
  | "title"
  | "trackConversion"
  | "url"
> & {
  type: "create" | "update";
  /** The id of the user who created/updated the link */
  comittedByUserId: string;
  /** The id of the link that was created/updated */
  linkId: string;
  timestamp: Date;
};

export async function addToHistory(entry: LinkHistory): Promise<void> {
  await prisma.linkHistory.create({
    data: {
      type: entry.type,
      archived: entry.archived,
      domain: entry.domain,
      key: entry.key,
      proxy: entry.proxy,
      publicStats: entry.publicStats,
      timestamp: entry.timestamp,
      trackConversion: entry.trackConversion,
      url: entry.url,
      linkId: entry.linkId,
      committedByUserId: entry.comittedByUserId,
      android: entry.android,
      description: entry.description,
      expiredUrl: entry.expiredUrl,
      expiresAt: entry.expiresAt,
      externalId: entry.externalId,
      geo: entry.geo || undefined,
      image: entry.image,
      ios: entry.ios,
      title: entry.title,
    },
  });
}
