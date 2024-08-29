import Heading from "@/components/Heading";
import QuickLinks from "@/components/page/common/QuickLinks";
import Redirect from "@/components/page/index/Redirect";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import { MetadataProps } from "@/lib/page";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

const URL = "https://go.gov.my";
const REDIRECT_SECONDS = 10;

export async function generateMetadata({
  params: { locale },
}: MetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const title = t("metadata.notFound.title");
  const description = t("metadata.notFound.description");
  const imageUrl = t("metadata.site.openGraph.images.1.url");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: t("app.name"),
      url: process.env.APP_URL,
      type: "website",
    },
    other: {
      "og:image": imageUrl,
      "og:image:width": 1200,
      "og:image:height": 630,
      "twitter:image": imageUrl,
      "twitter:image:width": 1200,
      "twitter:image:height": 630,
    },
  };
}

export default async function PageNotFound({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <main
      className={cn(
        "pt-[5rem] md:pt-[4rem] lg:pt-[7rem]",
        "px-[1.125rem] lg:px-0",
        "h-full w-full",
        "flex grow flex-col items-center justify-start",
      )}
    >
      <div
        className={cn(
          "flex grow flex-col items-center justify-start tall:justify-center",
        )}
      >
        <RoundedText
          variant="danger"
          weight="medium"
          textSize="smallFixed"
          textStyle="uppercase"
        >
          {t("pages.notFound.tag")}
        </RoundedText>
        <div className={cn("grid grid-cols-12 grid-rows-3")}>
          <Heading
            level={2}
            className={cn("col-span-full", "text-center", "mt-[1.5rem]")}
          >
            {t("pages.notFound.title")}
          </Heading>
          <Paragraph
            textAlign="center"
            className={cn(
              "col-span-full md:col-start-4 md:col-end-10",
              "mt-[1rem]",
            )}
          >
            {t("pages.notFound.description")}
          </Paragraph>
          <Paragraph
            textSize="small"
            textAlign="center"
            className={cn("col-span-full", "mt-[1.5rem] md:mt-[2.5rem]")}
          >
            {t.rich("pages.common.redirect.description", {
              duration: (chunks) => (
                <Redirect url={URL} countInSeconds={REDIRECT_SECONDS} />
              ),
            })}
          </Paragraph>
        </div>
      </div>
      <QuickLinks />
    </main>
  );
}
