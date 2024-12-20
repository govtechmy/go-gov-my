"use client";

import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import { Paragraph } from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import IconArrowRight from "@/icons/arrow-right";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import AnimationCheckLink from "./AnimationCheckLink";
import Redirect from "./Redirect";

type Props = {
  redirectUrl: string;
  redirectSeconds: number;
};

export default function RedirectContent(props: Props) {
  const t = useTranslations();

  return (
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
              {process.env.NEXT_PUBLIC_APP_DOMAIN}
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
          href={props.redirectUrl}
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
                url={props.redirectUrl}
                countInSeconds={props.redirectSeconds}
              />
            ),
          })}
        </Paragraph>
      </div>
    </div>
  );
}
