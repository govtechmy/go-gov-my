import Head from "next/head";
import Masthead from "@/components/Masthead";
import { type MetadataProps } from "@/lib/page";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Inter, Poppins } from "next/font/google";
import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export async function generateStaticParams() {
  return [{ locale: "en-MY" }, { locale: "ms-MY" }];
}

export async function generateMetadata({
  params: { locale },
}: MetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: "{{.Title}}",
    description: "{{.Description}}",
    openGraph: {
      title: "{{.Title}}",
      description: "{{.Description}}",
      siteName: t("openGraph.url.index", { baseUrl: process.env.APP_URL }),
      type: "website",
    },
    // Specfiy og images in 'other' instead of 'openGraph'. Otherwise, the
    // template value '{{.ImageURL}}' will be considered a path and transformed
    // to 'https://oursite.com/%7B%7B.ImageURL%7D%7D'
    other: {
      "og:image": "{{.ImageURL}}",
      "og:image:width": 1200,
      "og:image:hieght": 630,
      "twitter:image": "{{.ImageURL}}",
      "twitter:image:width": 1200,
      "twitter:image:hieght": 630,
    },
  };
}

export default async function Layout({ children, params: { locale } }: Props) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={cn(
          inter.className,
          poppins.variable,
          "flex min-w-[320px] flex-col",
        )}
      >
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider messages={messages}>
            <div className="flex h-[100vh] flex-col">
              <Masthead />
              {/* <Header locale={locale} /> */}
              <div className="flex-1">{children}</div>
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
