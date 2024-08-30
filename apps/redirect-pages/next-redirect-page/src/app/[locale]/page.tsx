import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import Page from "@/components/page/common/Page";
import AnimationCheckLink from "@/components/page/index/AnimationCheckLink";
import Redirect from "@/components/page/index/Redirect";
import {
  GOAPP_PARAM_DESCRIPTION,
  GOAPP_PARAM_OG_IMAGE_URL,
  GOAPP_PARAM_TITLE,
  GOAPP_PARAM_URL,
} from "@/constants/goapp";
import IconArrowRight from "@/icons/arrow-right";
import { getPageMetadata, type MetadataProps } from "@/lib/page";
import { cn } from "@/lib/utils";
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
      <div
        className={cn(
          "flex grow flex-col items-center justify-start tall:justify-center",
        )}
      >
        <Heading level={2} className="text-center md:text-start">
          {t("pages.index.verify.title")}
        </Heading>
        <Paragraph
          textSize="small"
          textAlign="center"
          className="mt-[0.75rem] md:mt-[1rem]"
        >
          {t.rich("pages.index.verify.description", {
            em: (chunks) => (
              <RoundedText variant="primary" weight="medium" textSize="small">
                go.gov.my
              </RoundedText>
            ),
          })}
        </Paragraph>
        <AnimationCheckLink
          className={cn(
            "mt-[1.5rem] md:mt-[2.5rem]",
            "overflow-hidden rounded-[2rem]",
            "border border-gray-outline-200",
          )}
        />
        <div
          className={cn(
            "mt-[2.25rem] md:mt-[2.5rem]",
            "flex flex-col items-center",
          )}
        >
          <ButtonB
            variant="primary"
            size="large"
            href={REDIRECT_URL}
            rel={["noreferrer", "noopener"]}
            target="_self"
            iconEnd={<IconArrowRight />}
          >
            <span className="text-center">
              {t.rich("pages.index.links.skip", {
                br: (chunks) => <br className="hidden" />,
              })}
            </span>
          </ButtonB>
          <Paragraph
            textAlign="center"
            textSize="small"
            className={cn("mt-[1.125rem] md:mt-[1rem]")}
          >
            {t.rich("pages.common.redirect.description", {
              duration: (chunks) => (
                <Redirect
                  url={REDIRECT_URL}
                  countInSeconds={REDIRECT_SECONDS}
                />
              ),
            })}
          </Paragraph>
        </div>
      </div>
    </Page>
  );
}
