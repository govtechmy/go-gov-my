import { cn } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import React from "react";
import ButtonB from "../../ButtonB";
import Image from "next/image";

const quickLinks = [
  {
    title: {
      key: "pages.index.quickLinks.governmentOfMalaysia.title",
    },
    href: process.env.MALAYSIA_GOV_URL || "https://www.malaysia.gov.my/portal/",
    img: {
      src: "/__goapp_public__/jata-negara.png",
      alt: {
        key: "pages.index.quickLinks.governmentOfMalaysia.img.alt",
      },
    },
  },
  {
    title: {
      key: "pages.index.quickLinks.goGovMy.title",
    },
    href: process.env.NEXT_PUBLIC_APP_DOMAIN || "https://go.gov.my/",
    img: {
      src: "/__goapp_public__/icons/logo.svg",
      alt: {
        key: "pages.index.quickLinks.goGovMy.img.alt",
      },
    },
  },
];

export default async function QuickLinks() {
  const t = await getTranslations();

  return (
    <div className={cn("flex-0 pt-[4rem] lg:pt-[7rem]", "w-full", "pb-[4rem]")}>
      <div className={cn("flex flex-row justify-center")}>
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
                className={cn("flex flex-row items-center", "gap-x-[0.5rem]")}
              >
                <Image
                  src={img.src}
                  width={36}
                  height={28}
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
  );
}
