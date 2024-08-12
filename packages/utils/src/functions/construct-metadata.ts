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
  console.log("description1", description, title, image);
  if (!title && locale === "ms") {
    title = `${process.env.NEXT_PUBLIC_APP_NAME} - Pengurusan Pautan untuk Kerajaan Malaysia`;
    image =
      "https://gogovmy-dev.s3.ap-southeast-2.amazonaws.com//public/GoGovMetaMs-min.png";
  }
  if (!description && locale === "ms") {
    description = `${process.env.NEXT_PUBLIC_APP_NAME} - sebuah portal rasmi Kerajaan Malaysia untuk memendekkan pautan.`;
    image =
      "https://gogovmy-dev.s3.ap-southeast-2.amazonaws.com//public/GoGovMetaMs-min.png";
  }
  if (!title && locale === "en") {
    // Default english
    title = `${process.env.NEXT_PUBLIC_APP_NAME} - Link Shortener for Malaysia Government`;
    image =
      "https://gogovmy-dev.s3.ap-southeast-2.amazonaws.com//public/GoGovMetaEn-min.png";
  }
  if (!description && locale === "en") {
    description = `${process.env.NEXT_PUBLIC_APP_NAME} is the official link shortener for the Malaysia government.`;
    image =
      "https://gogovmy-dev.s3.ap-southeast-2.amazonaws.com//public/GoGovMetaEn-min.png";
  }
  console.log("description2", description, title, image);
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
