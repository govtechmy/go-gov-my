"use client";

import { Icon } from "@/icons/social-media";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from 'next/navigation';

type Props = {
  ministry: string;
  copyrightKey: string;
  lastUpdateKey: string;
  descriptionWithNewlines: string;
  disclaimerKey: string;
  privacyPolicyKey: string;
  links: {
    title?: string;
    links: {
      name: string;
      href: string;
    }[];
  }[];
};

export const social_media = [
  {
    icon: <Icon.Facebook />,
    name: "Facebook",
    href: "https://www.facebook.com/KementerianDigitalMalaysia/",
  },
  { icon: <Icon.X />, name: "X", href: "https://x.com/KemDigitalMsia" },
  {
    icon: <Icon.Instagram />,
    name: "Instagram",
    href: "https://www.instagram.com/kementeriandigitalmalaysia/",
  },
  {
    icon: <Icon.Tiktok />,
    name: "Tiktok",
    href: "https://www.tiktok.com/@kementeriandigital",
  },
];

export default function Footer(props: Props) {
  const format = useFormatter();
  const t = useTranslations("components.Footer");
  const searchParams = useSearchParams();
  const locale = searchParams.get("locale") || "en-GB";

  const className = {
    link: "text-sm text-black-700 [text-underline-position:from-font] hover:text-black-900 hover:underline",
  };

  return (
    <div className="border-t border-outline-200 bg-background-50 py-8 lg:py-16 print:hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <div className="flex flex-col gap-6 pb-8 lg:flex-row lg:justify-between">
          <div className="flex flex-col gap-4 lg:gap-4.5">
            <div className="flex items-center gap-x-2.5">
              <Image
                src="/jata-negara.png"
                width={28}
                height={28}
                className={cn("object-contain")}
                alt="Jata Negara"
              />
              <div>
                <h6 className="whitespace-nowrap font-poppins font-semibold">
                  {props.ministry}
                </h6>
              </div>
            </div>
            <p
              className="text-sm text-black-700"
              dangerouslySetInnerHTML={{
                __html: props.descriptionWithNewlines.replaceAll("\n", "<br/>"),
              }}
            ></p>
            <div className="space-y-2 lg:space-y-3">
              <p className="text-sm font-semibold">{t("follow_us")}</p>
              <div className="flex gap-3">
                {social_media.map(({ icon, href }) => (
                  <a key={href} href={href} target="_blank" rel="noopenner noreferrer">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
          {/* Right menu */}
          <div className="flex flex-col gap-6 text-sm lg:flex-row">
            {props.links.map((item, index) => (
              <div className="space-y-2" key={index}>
                {item.title && <p className="font-semibold">{item.title}</p>}
                <div className="grid grid-cols-2 flex-col gap-y-2 sm:grid-cols-4 sm:gap-x-6 lg:flex lg:w-[200px] lg:gap-2">
                  {item.links.map(({ name, href }) => (
                    <a
                      key={name}
                      className={className.link}
                      target="_blank"
                      rel="noopenner noreferrer"
                      href={href}
                    >
                      {name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col justify-between gap-6 pt-8 text-sm text-dim-500 lg:flex-row">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <p>
              {props.copyrightKey} © {new Date().getFullYear()}
            </p>
             <span className="hidden h-3 w-px bg-outline-300 lg:block"></span>
              <div className="flex flex-wrap gap-x-3 gap-y-2 text-black-700">
              {["disclaimer", "privacy-policy"].map((link) => (
                <Link
                  key={link}
                  className="underline-font text-sm text-black-700 hover:text-foreground hover:underline" 
                  href={`/${link}?locale=${locale}`}
                >
                  {link === "disclaimer" ? props.disclaimerKey : props.privacyPolicyKey}
                </Link>
              ))}
            </div>
          </div>
          <span>
            {props.lastUpdateKey +
              ": " +
              format.dateTime(new Date(process.env.NEXT_PUBLIC_LAST_UPDATED || Date.now()), {
                year: "numeric",
                month: "long", 
                day: "numeric",
                hour12: true,
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Kuala_Lumpur",
              }).replace(/\bam\b/, "AM").replace(/\bpm\b/, "PM")}
          </span>
        </div>
      </div>
    </div>
  );
}
