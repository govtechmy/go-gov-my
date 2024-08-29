import Heading from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import QuickLinks from "@/components/page/common/QuickLinks";
import SecureLinkForm from "@/components/page/secure/SecureLinkForm";
import type { MetadataProps } from "@/lib/page";
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

export default async function PageSecure({ params: { locale } }: PageProps) {
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
          {t("pages.index.password.title")}
        </Heading>
        <Paragraph
          textSize="small"
          textAlign="center"
          className="mt-[0.75rem] md:mt-[1rem]"
        >
          {t("pages.index.password.description")}
        </Paragraph>
        <SecureLinkForm />
      </div>
      <QuickLinks />
    </main>
  );
}
