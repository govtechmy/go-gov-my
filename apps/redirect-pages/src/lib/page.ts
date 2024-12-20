import { Metadata } from "next";

export type MetadataProps = {
  params: { locale: string };
};

type PageMetadataOptions = {
  title: string;
  description: string;
  url?: string;
  imageUrl: string;
  siteName: string;
};

export function getPageMetadata(options: PageMetadataOptions): Metadata {
  return {
    title: options.title,
    description: options.description,
    openGraph: {
      title: options.title,
      description: options.description,
      siteName: options.siteName,
      url: options.url || process.env.NEXT_PUBLIC_APP_DOMAIN,
      type: "website",
    },
    other: {
      "og:image": options.imageUrl,
      "og:image:width": 1200,
      "og:image:height": 630,
      "twitter:image": options.imageUrl,
      "twitter:image:width": 1200,
      "twitter:image:height": 630,
    },
  };
}
