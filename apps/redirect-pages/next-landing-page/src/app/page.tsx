import AnimatedRoundedText from "@/components/AnimatedRoundedText";
import Action from "@/components/home/Action";
import Hero from "@/components/home/Hero";
import Preview from "@/components/home/Preview";
import Stats from "@/components/home/Stats";
import { extract, getLocaleFromURL, keypath } from "@/lib/i18n";
import { getMessages, getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React, { ReactNode } from "react";
import RoundedText from "@/components/RoundedText";
import BrandLink from "@/components/BrandLink";
import { URL_APP_LOGIN, URL_FIGMA, URL_GITHUB } from "@/constants/urls";
import Masthead from "@/components/Masthead";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  searchParams: { locale?: string };
};

type StatsJson = {
  userCount: number;
  linkCount: number;
  totalClicks: number;
};
const SEGMENTS = [
  "mygcc",
  "moh",
  "miti",
  "digital",
  "moe",
  "mohr",
  "motac",
  "epf",
  "mof",
  "mcmc",
];

const ACTION_BASE_PATH = "pages.Home.Action";
const PREVIEW_BASE_PATH = "pages.Home.Preview";
const HERO_BASE_PATH = "pages.Home.Hero";
const STATS_BASE_PATH = "pages.Home.Stats";
const MASTHEAD_BASE_PATH = "components.Masthead";
const HEADER_BASE_PATH = "components.Header";

async function getStats() {
  const url = process.env.LANDING_STATS_JSON_URL;

  if (!url) {
    throw new Error("LANDING_STATS_JSON_URL is not set");
  }

  const response = await fetch(url);

  return (await response.json()) as StatsJson;
}

 export async function generateStaticParams() {
   return [{ locale: "en-GB" }, { locale: "ms-MY" }];
 }

export default async function Home({ searchParams }: Props) {
  const locale = getLocaleFromURL(new URL(`http://example.com?${new URLSearchParams(searchParams)}`));
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const stats = await getStats();
  const messages = await getMessages({ locale });

  return (
    <Main>
      <Masthead
                officialGovWebsiteKey={t(masthead.officialGovWebsiteKey)}
                howToIdentifyKey={t(masthead.howToIdentifyKey)}
                officialKey={t(masthead.officialKey)}
                notGovmyKey={t(masthead.notGovmyKey)}
                closeSiteKey={t(masthead.closeSiteKey)}
                secureKey={t(masthead.secureKey)}
                findLockKey={t(masthead.findLockKey)}
                orKey={t(masthead.orKey)}
                precautionKey={t(masthead.precautionKey)}
              />
      <Header
        signInKey={t(header.signInKey)}
      />
      <Hero 
        titleKey={t(hero.titleKey)}
        descriptionKey={t.rich(hero.descriptionKey, {
          em: (chunks) => (
            <RoundedText variant="primary" weight="medium">
              {chunks}
            </RoundedText>
          ),
        })}
        signInKey={t.rich(hero.signInKey, {
          a: (chunks) => (
            <BrandLink href={URL_APP_LOGIN} target="_blank" size="parent">
              {chunks}
            </BrandLink>
          ),
        })}
        buttonKey={t(hero.buttonKey)}
      />
      <Preview
        className="py-[3rem] md:py-[5.25rem]"
        title={t(preview.titleKey)}
        description={t.rich(preview.descriptionKey, {
          em: (chunks) => (
            <AnimatedRoundedText
              variant="outlined"
              padding="small"
              borderRadius="small"
              className="text-center"
              items={SEGMENTS}
              prefix="@"
              interval={2000} // Add an interval prop (adjust as needed)
            />
          ),
        })}
        items={preview.items.map((item) => ({
          tag: t(item.tagKey),
          title: t(item.titleKey),
          img: {
            ...item.img,
            alt: t(item.img.altKey),
          },
          animation: item.animation,
        }))}
      />
      <Stats
        total={{
          users: stats.userCount,
          links: stats.linkCount,
          clicks: stats.totalClicks,
        }}
        title={t(statsTranslations.titleKey)}
        segments={{
          publicOfficers: t(statsTranslations.segments.publicOfficers),
          linksCreated: t(statsTranslations.segments.linksCreated),
          clicksServed: t(statsTranslations.segments.clicksServed),
        }}
        counters={{
          daily: t(statsTranslations.counters.daily),
          total: t(statsTranslations.counters.total),
        }}
        dropdown={{
          daily: t(statsTranslations.dropdown.items.daily.label),
          weekly: t(statsTranslations.dropdown.items.weekly.label),
          monthly: t(statsTranslations.dropdown.items.monthly.label),
          yearly: t(statsTranslations.dropdown.items.yearly.label),
        }}
      />
      <Action
        title={t(action.titleKey)}
        buttonText={t(action.buttonKey)}
        description={t.rich(action.descriptionKey, {
          em: (chunks) => (
            <AnimatedRoundedText
              prefix="go.gov.my/"
              variant="primary"
              items={SEGMENTS}
              interval={2000} // Add an interval prop (adjust as needed)
            />
          ),
        })}
      />
      <Footer
                ministry={extract(messages, "common.names.kd")}
                descriptionWithNewlines={extract(
                  messages,
                  "components.Footer.address",
                )}
                links={[
                  {
                    title: extract(
                      messages,
                      "components.Footer.links.title.openSource",
                    ),
                    links: [
                      {
                        name: extract(
                          messages,
                          "components.Footer.links.name.figma",
                        ),
                        href: URL_FIGMA,
                      },
                      {
                        name: extract(
                          messages,
                          "components.Footer.links.name.github",
                        ),
                        href: URL_GITHUB,
                      }  
                    ],
                  },
                ]}
              />
    </Main>
  );
}

function Main(props: { children: ReactNode }) {
  return (
    <main className="flex w-full flex-col divide-y divide-washed-100 lg:py-0">
      {React.Children.map(props.children, (child) => (
        // Wrap each child in <article> to consistently display full-width dividers
        <article>{child}</article>
      ))}
    </main>
  );
}



const header = {
  signInKey: keypath(HEADER_BASE_PATH, "buttons.signIn"),
}

const preview = {
  titleKey: keypath(PREVIEW_BASE_PATH, "title"),
  descriptionKey: keypath(PREVIEW_BASE_PATH, "description"),
  items: [
    {
      tagKey: keypath(PREVIEW_BASE_PATH, "content.1.tag"),
      titleKey: keypath(PREVIEW_BASE_PATH, "content.1.title"),
      img: {
        svg: "/preview/content1/image.svg",
        webp: "/preview/content1/image.webp",
        altKey: keypath(PREVIEW_BASE_PATH, "content.1.title"),
      },

      animation: {
        src: "/rive/animation.riv",
        stateMachines: "customized",
        artboard: "customized",
      },
    },
    {
      tagKey: keypath(PREVIEW_BASE_PATH, "content.2.tag"),
      titleKey: keypath(PREVIEW_BASE_PATH, "content.2.title"),
      img: {
        svg: "/preview/content2/image.svg",
        webp: "/preview/content2/image.webp",
        altKey: keypath(PREVIEW_BASE_PATH, "content.2.title"),
      },
      animation: {
        src: "/rive/animation.riv",
        stateMachines: "anti-phishing",
        artboard: "anti-phishing",
      },
    },
    {
      tagKey: keypath(PREVIEW_BASE_PATH, "content.3.tag"),
      titleKey: keypath(PREVIEW_BASE_PATH, "content.3.title"),
      img: {
        svg: "/preview/content3/image.svg",
        webp: "/preview/content3/image.webp",
        altKey: keypath(PREVIEW_BASE_PATH, "content.3.title"),
      },
      animation: {
        src: "/rive/animation.riv",
        stateMachines: "social-sharing",
        artboard: "social-sharing",
      },
    },
    {
      tagKey: keypath(PREVIEW_BASE_PATH, "content.4.tag"),
      titleKey: keypath(PREVIEW_BASE_PATH, "content.4.title"),
      img: {
        svg: "/preview/content4/image.svg",
        webp: "/preview/content4/image.webp",
        altKey: keypath(PREVIEW_BASE_PATH, "content.4.title"),
      },
      animation: {
        src: "/rive/animation.riv",
        stateMachines: "analytics",
        artboard: "analytics",
      },
    },
  ],
};

const action = {
  titleKey: keypath(ACTION_BASE_PATH, "title"),
  descriptionKey: keypath(ACTION_BASE_PATH, "description"),
  buttonKey: keypath(ACTION_BASE_PATH, "buttons.createLink"),
};

const hero = {
  titleKey: keypath(HERO_BASE_PATH, "title"),
  descriptionKey: keypath(HERO_BASE_PATH, "description"),
  signInKey: keypath(HERO_BASE_PATH, "signIn"),
  buttonKey: keypath(HERO_BASE_PATH, "buttons.createLink"),
};

const statsTranslations = {
  titleKey: keypath(STATS_BASE_PATH, "title"),
  segments: {
    publicOfficers: keypath(STATS_BASE_PATH, "segments.publicOfficers"),
    linksCreated: keypath(STATS_BASE_PATH, "segments.linksCreated"),
    clicksServed: keypath(STATS_BASE_PATH, "segments.clicksServed"),
  },
  counters: {
    daily: keypath(STATS_BASE_PATH, "counters.daily"),
    total: keypath(STATS_BASE_PATH, "counters.total"),
  },
  dropdown: {
    items: {
      daily: { label: keypath(STATS_BASE_PATH, "dropdown.items.daily.label") },
      weekly: { label: keypath(STATS_BASE_PATH, "dropdown.items.weekly.label") },
      monthly: { label: keypath(STATS_BASE_PATH, "dropdown.items.monthly.label") },
      yearly: { label: keypath(STATS_BASE_PATH, "dropdown.items.yearly.label") },
    },
  },
};

const masthead = {
  officialGovWebsiteKey: keypath(MASTHEAD_BASE_PATH, "official_gov_website"),
  howToIdentifyKey: keypath(MASTHEAD_BASE_PATH, "how_to_identify"),
  officialKey: keypath(MASTHEAD_BASE_PATH, "official"),
  notGovmyKey: keypath(MASTHEAD_BASE_PATH, "not_govmy"),
  closeSiteKey: keypath(MASTHEAD_BASE_PATH, "close_site"),
  secureKey: keypath(MASTHEAD_BASE_PATH, "secure"),
  findLockKey: keypath(MASTHEAD_BASE_PATH, "find_lock"),
  orKey: keypath(MASTHEAD_BASE_PATH, "or"),
  precautionKey: keypath(MASTHEAD_BASE_PATH, "precaution"),
};
