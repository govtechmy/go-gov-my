import Heading from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import Page from "@/components/page/common/Page";
import SecureLinkForm from "@/components/page/secure/SecureLinkForm";
import { getPageMetadata, type MetadataProps } from "@/lib/page";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: MetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const title = t("metadata.secure.title");
  const description = t("metadata.secure.description");
  const imageUrl = t("metadata.site.openGraph.images.1.url");

  return getPageMetadata({
    title,
    description,
    imageUrl,
    siteName: t("app.name"),
  });
}

export default async function PageSecure({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <Page>
      <div
        className={cn(
          "flex grow flex-col items-center justify-start tall:justify-center",
        )}
      >
        <img
          width={32}
          height={32}
          src="/__goapp_public__/icons/padlock.svg"
          alt="Logo"
        />
        <Heading
          level={2}
          className={cn("text-center", "mt-[0.75rem] md:mt-[1rem]")}
        >
          {t("pages.password.title")}
        </Heading>
        <Paragraph
          textSize="small"
          textAlign="center"
          className="mt-[0.75rem] md:mt-[1rem]"
        >
          {t("pages.password.description")}
        </Paragraph>
        <SecureLinkForm />
      </div>
    </Page>
  );
}
