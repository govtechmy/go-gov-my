import { unstable_setRequestLocale } from "next-intl/server";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";
import Masthead from "@/components/Masthead";
import { URL_FIGMA, URL_GITHUB } from "@/constants/urls";
import { extract } from "@/lib/i18n";
import { type MetadataProps } from "@/lib/page";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Inter, Poppins } from "next/font/google";
import "../globals.css";
import { Suspense } from "react";

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
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: t("openGraph.url.index", { baseUrl: process.env.APP_URL }),
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

export default async function Layout({ children, params: { locale } }: Props) {
  // Pass 'locale' to a cache to distribute it to all Server Components
  // https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing#add-unstable_setrequestlocale-to-all-layouts-and-pages
  unstable_setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} data-build-version="0.0.1">
      <body
        className={cn(
          inter.className,
          poppins.variable,
          "flex min-w-[320px] flex-col",
        )}
      >
        <ThemeProvider defaultTheme="light">
          <NextIntlClientProvider messages={messages}>
            <div className="flex min-h-screen flex-col">
              <Masthead />
              <Header locale={locale} />
              <div className="flex-1">{children}</div>
              <Footer
                ministry={extract(messages, "common.names.kd")}
                descriptionWithNewlines={extract(
                  messages,
                  "components.Footer.address",
                )}
                links={[
                  {
                    title: extract(
                      messages,
                      "components.Footer.links.title.openSource",
                    ),
                    links: [
                      // {
                      //   name: extract(
                      //     messages,
                      //     "components.Footer.links.name.github",
                      //   ),
                      //   href: URL_GITHUB,
                      // },
                      {
                        name: extract(
                          messages,
                          "components.Footer.links.name.figma",
                        ),
                        href: URL_FIGMA,
                      },
                    ],
                  },
                ]}
              />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
