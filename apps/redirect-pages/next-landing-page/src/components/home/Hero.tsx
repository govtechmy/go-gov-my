"use client";

import BorderedSection from "@/components/BorderedSection";
import BrandLink from "@/components/BrandLink";
import ButtonB from "@/components/ButtonB";
import Heading from "@/components/Heading";
import Paragraph from "@/components/Paragraph";
import RoundedText from "@/components/RoundedText";
import { URL_APP_LOGIN, URL_APP_MAIN } from "@/constants/urls";
import IconLink from "@/icons/link";
import { cn } from "@/lib/utils";
import Rive from "@rive-app/react-canvas";
import { useTranslations } from "next-intl";

type Props = {
  id?: string;
  className?: string;
};

export default function Hero(props: Props) {
  const t = useTranslations();

  return (
    // Disable left/right padding on the container
    <BorderedSection
      id={props.id}
      className={cn("px-0", "grid grid-cols-12", props.className)}
    >
      <div
        className={cn(
          "col-span-full lg:col-start-2 lg:col-end-6",
          "px-[1.125rem] py-[3rem] lg:py-0 lg:pl-[1.5rem] lg:pr-0 lg:pt-0",
          "flex flex-col items-center lg:items-start lg:justify-center",
          "md:max-lg:mx-auto md:max-lg:w-[600px]",
          "order-2 lg:order-none",
          props.className,
        )}
      >
        <div className="grid grid-cols-12 lg:flex">
          <Heading
            level={1}
            className={cn(
              "col-start-2 col-end-12",
              "text-pretty text-center lg:text-start",
            )}
          >
            {t("pages.Home.Hero.title")}
          </Heading>
        </div>
        <div className="grid grid-cols-12 lg:flex">
          <Paragraph
            className={cn(
              "col-start-2 col-end-12",
              "mt-[1.625rem]",
              "text-center lg:text-start",
            )}
          >
            {t.rich("pages.Home.Hero.description", {
              em: (chunks) => (
                <RoundedText variant="primary" weight="medium">
                  {chunks}
                </RoundedText>
              ),
            })}
          </Paragraph>
        </div>
        <div className="mt-[2.25rem] flex flex-row items-center">
          <ButtonB
            variant="primary"
            size="large"
            href={URL_APP_MAIN}
            target="_blank"
            iconEnd={<IconLink />}
          >
            <span>{t("pages.Home.Hero.buttons.createLink")}</span>
          </ButtonB>
        </div>
        <Paragraph className="mt-[1.125rem] text-center lg:text-start">
          {t.rich("pages.Home.Hero.signIn", {
            a: (chunks) => (
              <BrandLink size="parent" href={URL_APP_LOGIN}>
                {chunks}
              </BrandLink>
            ),
          })}
        </Paragraph>
      </div>
      <div
        className={cn(
          "col-span-full lg:col-start-7 lg:col-end-13",
          "mt-[3rem] lg:mt-0",
          "border-washed-100 max-lg:border-b",
          "lg:h-[43.75rem]",
          "lg:pr-0",
          "order-1 lg:order-none",
        )}
      >
        <Rive
          src="/rive/animation.riv"
          stateMachines="home"
          artboard="home"
          className="h-[18.75rem] min-w-full md:h-[32rem] lg:h-[43.75rem]"
        />
      </div>
      {/* <picture className="col-span-full mt-[3rem] border-t border-washed-100 object-cover lg:col-span-6 lg:col-start-7 lg:mt-0 lg:border-t-0 lg:pr-0">
        <source srcSet="/preview/hero/image.webp" type="image/webp" />
        <source srcSet="/preview/hero/image.svg" type="image/svg+xml" />
        <img
          src="/preview/hero/image.svg"
          alt="Hero"
          className={cn(
            "h-[18.75rem] w-full object-contain",
            "md:max-lg:h-[25rem]",
            "lg:h-[43.75rem]",
          )}
        />
      </picture> */}
    </BorderedSection>
  );
}
