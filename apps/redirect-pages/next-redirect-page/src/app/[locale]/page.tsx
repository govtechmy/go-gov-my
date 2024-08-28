import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import AnimationCheckLink from "@/components/page/index/AnimationCheckLink";
import Redirect from "@/components/page/index/Redirect";
import QuickLinks from "@/components/page/common/QuickLinks";
import { GOAPP_PARAM_URL } from "@/constants/goapp";
import IconArrowRight from "@/icons/arrow-right";
import { cn } from "@/lib/utils";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";

const URL = GOAPP_PARAM_URL;
const REDIRECT_SECONDS = 10;

export default async function PageIndex({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <>
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
              "border-gray-outline-200 border",
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
              href={URL}
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
              {t.rich("pages.index.redirect.description", {
                duration: (chunks) => (
                  <Redirect url={URL} countInSeconds={REDIRECT_SECONDS} />
                ),
              })}
            </Paragraph>
          </div>
        </div>
        <QuickLinks />
      </main>
    </>
  );
}
