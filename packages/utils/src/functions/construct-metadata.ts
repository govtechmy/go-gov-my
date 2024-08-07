import { Metadata } from "next";
import { DUB_THUMBNAIL, HOME_DOMAIN } from "../constants";

export function constructMetadata({
  locale,
  title,
  description,
  image = DUB_THUMBNAIL,
  icons = [
    {
      rel: "apple-touch-icon",
      sizes: "32x32",
      url: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
  ],
  noIndex = false,
}: {
  locale?: string;
  title?: string;
  description?: string;
  image?: string | null;
  icons?: Metadata["icons"];
  noIndex?: boolean;
} = {}): Metadata {
  if (!title && locale === "en")
    title = `${process.env.NEXT_PUBLIC_APP_NAME} - Link Management for Modern Marketing Teams`;
  if (!title && locale === "ms")
    title = `${process.env.NEXT_PUBLIC_APP_NAME} - Pengurusan Penghubung untuk Pemasaran Moden`;
  if (!description && locale === "en")
    description = `${process.env.NEXT_PUBLIC_APP_NAME} is the open-source link management infrastructure for modern marketing teams to create, share, and track short links.`;
  if (!description && locale === "ms")
    description = `${process.env.NEXT_PUBLIC_APP_NAME} - adalah infrastruktur pengurusan penghubung sumber terbuka untuk pemasaran moden bagi cipta, kongsi dan jejaki penghubung pendek`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image && {
        images: [
          {
            url: image,
          },
        ],
      }),
    },
    twitter: {
      title,
      description,
      ...(image && {
        card: "summary_large_image",
        images: [image],
      }),
    },
    icons,
    metadataBase: new URL(HOME_DOMAIN),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
