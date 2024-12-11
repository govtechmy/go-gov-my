import Page from "@/components/page/download/Page";
import DownloadContent from "@/components/page/download/DownloadContent";
import {
  GOAPP_PARAM_DESCRIPTION,
  GOAPP_PARAM_OG_IMAGE_URL,
  GOAPP_PARAM_TITLE,
  GOAPP_PARAM_URL,
  GOAPP_PARAM_FILES
} from "@/constants/goapp";
import { getPageMetadata, type MetadataProps } from "@/lib/page";
import type { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

const REDIRECT_URL = GOAPP_PARAM_URL;
const REDIRECT_SECONDS = 10;

export async function generateMetadata({
  params: { locale },
}: MetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale });

  return getPageMetadata({
    title: GOAPP_PARAM_TITLE,
    description: GOAPP_PARAM_DESCRIPTION,
    imageUrl: GOAPP_PARAM_OG_IMAGE_URL,
    siteName: t("app.name"),
  });
}

export default async function PageIndex({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <Page>
      <DownloadContent
        redirectSeconds={REDIRECT_SECONDS}
        redirectUrl={REDIRECT_URL}
        files={GOAPP_PARAM_FILES}
      />
    </Page>
  );
}
