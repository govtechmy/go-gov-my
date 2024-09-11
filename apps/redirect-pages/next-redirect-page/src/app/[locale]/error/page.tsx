import Heading from "@/components/Heading";
import Page from "@/components/page/common/Page";
import Redirect from "@/components/page/common/RedirectContent/Redirect";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import { getPageMetadata, MetadataProps } from "@/lib/page";
import { cn } from "@/lib/utils";
import { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

const URL = "https://go.gov.my";
const REDIRECT_SECONDS = 10;

export async function generateMetadata({
  params: { locale },
}: MetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const title = t("metadata.serverError.title");
  const description = t("metadata.serverError.description");
  const imageUrl = t("metadata.site.openGraph.images.1.url");

  return getPageMetadata({
    title,
    description,
    imageUrl,
    siteName: t("app.name"),
  });
}

export default async function PageNotFound({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <Page>
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
          {t("pages.error.tag")}
        </RoundedText>
        <div className={cn("grid grid-cols-12 grid-rows-3")}>
          <Heading
            level={2}
            className={cn("col-span-full", "text-center", "mt-[1.5rem]")}
          >
            {t("pages.error.title")}
          </Heading>
          <Paragraph
            textAlign="center"
            className={cn(
              "col-span-full md:col-start-4 md:col-end-10",
              "mt-[1rem]",
            )}
          >
            {t("pages.error.description")}
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
    </Page>
  );
}
