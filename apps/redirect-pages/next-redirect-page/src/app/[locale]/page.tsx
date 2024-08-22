import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import AnimationCheckLink from "@/components/home/AnimationCheckLink";
import Redirect from "@/components/home/Redirect";
import IconArrowRight from "@/icons/arrow-right";
import { cn } from "@/lib/utils";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React from "react";

type Props = {
  params: { locale: string };
};

const URL = "{{.URL}}";
const REDIRECT_SECONDS = 10;

const quickLinks = [
  {
    title: {
      key: "pages.index.quickLinks.governmentOfMalaysia.title",
    },
    href: "https://www.malaysia.gov.my/portal/",
    img: {
      src: "/jata-negara.png",
      alt: {
        key: "pages.index.quickLinks.governmentOfMalaysia.img.alt",
      },
    },
  },
  {
    title: {
      key: "pages.index.quickLinks.goGovMy.title",
    },
    href: "https://go.gov.my/",
    img: {
      src: "/logo.svg",
      alt: {
        key: "pages.index.quickLinks.goGovMy.img.alt",
      },
    },
  },
];

export default async function Home({ params: { locale } }: Props) {
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
        <ButtonB
          variant="tertiaryColor"
          size="large"
          href={URL}
          rel={["noreferrer", "noopener"]}
          target="_self"
          iconEnd={<IconArrowRight />}
          className="mt-[2.25rem] md:mt-[2.5rem]"
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
          className={cn("mt-[1.125rem] md:mt-[1rem]", "mb-[1rem] lg:mb-0")}
        >
          {t.rich("pages.index.redirect.description", {
            duration: (chunks) => (
              <Redirect url={URL} countInSeconds={REDIRECT_SECONDS} />
            ),
          })}
        </Paragraph>
        <div className={cn("mt-[4rem] lg:mt-[7rem]", "w-full", "pb-[4rem]")}>
          <div
            className={cn(
              // "grid grid-cols-[1fr_min-content_1fr]",
              "flex flex-row justify-center",
            )}
          >
            {quickLinks.map(({ title, href, img }, i) => (
              <React.Fragment key={i}>
                <div
                  className={cn(
                    "flex flex-row items-center",
                    i % 2 === 0 ? cn("justify-end") : cn("justify-start"),
                  )}
                >
                  <ButtonB
                    variant="tertiary"
                    size="small"
                    href={href}
                    target="_blank"
                    className={cn(
                      "flex flex-row items-center",
                      "gap-x-[0.5rem]",
                    )}
                  >
                    <img
                      src={img.src}
                      className="h-[1.75rem] w-[2.25rem] object-contain md:h-[1.5rem] md:w-[1.875rem]"
                      alt={t(img.alt.key)}
                    />
                    <span
                      className={cn(
                        "hidden md:inline",
                        "font-heading font-semibold text-black-900",
                      )}
                    >
                      {t(title.key)}
                    </span>
                  </ButtonB>
                </div>
                {/* Show divider for items in the first column */}
                {i % 2 === 0 && (
                  <div
                    className={cn(
                      "mx-[0.75rem] my-auto md:mx-[1rem]",
                      "h-[0.75rem] w-px",
                      "bg-gray-outline-300",
                    )}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
