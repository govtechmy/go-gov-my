import { unstable_setRequestLocale } from "next-intl/server";
import { getLocaleFromURL} from "@/lib/i18n";
import { type MetadataProps } from "@/lib/page";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Inter, Poppins } from "next/font/google";
import "../globals.css";

export const dynamic = 'force-dynamic'

type Props = {
  children: React.ReactNode;
  params: { locale?: string };
  // searchParams: { locale?: string };
};


export async function generateStaticParams() {
  return [{ locale: "en-GB" }, { locale: "ms-MY" }];
}

export async function generateMetadata({
   params: { locale }
}: MetadataProps): Promise<Metadata> {
  const l = getLocaleFromURL(new URL(`http://example.com?${new URLSearchParams(locale)}`));
  const t = await getTranslations({ l, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: t("openGraph.url.index", { baseUrl: process.env.NEXT_PUBLIC_APP_URL }),
      type: "website",
      images: [
        {
          url: t("openGraph.images.1.url"),
          alt: t("openGraph.images.1.alt"),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}
//searchParams
export default async function Layout({ children, params: { locale } }: Props) {
  const l = getLocaleFromURL(new URL(`http://example.com?${new URLSearchParams(locale)}`));
  unstable_setRequestLocale(l);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div className="flex max-h-screen flex-col">
        <div className="flex-1">{children}</div>
      </div>
    </NextIntlClientProvider>
  );
}
