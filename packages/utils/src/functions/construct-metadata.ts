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
  if (!title) {
    if (locale === "ms") {
      title = `${process.env.NEXT_PUBLIC_APP_NAME} - Pengurusan Pautan untuk Kerajaan Malaysia`;
    } else {
      title = `${process.env.NEXT_PUBLIC_APP_NAME} - Link Shortener for Malaysia Government`;
    }
  }
  if (!description) {
    if (locale === "ms") {
      description = `${process.env.NEXT_PUBLIC_APP_NAME} - sebuah portal rasmi Kerajaan Malaysia untuk memendekkan pautan.`;
    } else {
      description = `${process.env.NEXT_PUBLIC_APP_NAME} is the official link shortener for the Malaysia government.`;
    }
  }
  if (!image) {
    if (locale === "ms") {
      image =
        "https://gogovmy-dev.s3.ap-southeast-2.amazonaws.com//public/GoGovMetaMs-min.png";
    } else {
      image =
        "https://gogovmy-dev.s3.ap-southeast-2.amazonaws.com//public/GoGovMetaEn-min.png";
    }
  }
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
