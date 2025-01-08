import AnimatedRoundedText from "@/components/AnimatedRoundedText";
import Action from "@/components/home/Action";
import Hero from "@/components/home/Hero";
import Preview from "@/components/home/Preview";
import Stats from "@/components/home/Stats";
import { extract, getLocaleFromURL, keypath } from "@/lib/i18n";
import {
  getMessages,
  getTranslations,
  unstable_setRequestLocale,
} from "next-intl/server";
import React, { ReactNode } from "react";
import RoundedText from "@/components/RoundedText";
import BrandLink from "@/components/BrandLink";
import { URL_APP_LOGIN, URL_FIGMA, URL_GITHUB } from "@/constants/urls";
import Masthead from "@/components/Masthead";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import StatsNew from "@/components/home/StatsNew";

type Props = {
  searchParams: { locale?: string };
};

type MetadataItem = {
  date: string;
  total: number;
};

type StatsJson = {
  clicksMetadata: MetadataItem[];
  linksMetadata: MetadataItem[];
  officersMetadata: MetadataItem[];
};

const SEGMENTS = [
  "mygcc",
  "moh",
  "miti",
  "digital",
  "moe",
  "moh",
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
const FOOTER_BASE_PATH = "components.Footer";
async function getStats() {
  try {
    const url = process.env.LANDING_STATS_JSON_URL;
    if (!url) {
      throw new Error("LANDING_STATS_JSON_URL is not set");
    }

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return (await response.json()) as StatsJson;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      clicksMetadata: [],
      linksMetadata: [],
      officersMetadata: []
    };
  }
}

export async function generateStaticParams() {
  return [{ locale: "en-GB" }, { locale: "ms-MY" }];
}

export default async function Home({ searchParams }: Props) {
  const locale = getLocaleFromURL(
    new URL(`http://example.com?${new URLSearchParams(searchParams)}`),
  );
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const stats = await getStats();
  const messages = await getMessages({ locale });

  // Get the latest total values for each metric
  const getLatestTotal = (metadata: MetadataItem[]) => {
    if (metadata.length === 0) return 0;
    
    return metadata.reduce((latest, current) => {
      const latestDate = new Date(latest.date);
      const currentDate = new Date(current.date);
      return currentDate > latestDate ? current : latest;
    }).total;
  };

  const latestClicks = getLatestTotal(stats.clicksMetadata);
  const latestLinks = getLatestTotal(stats.linksMetadata);
  const latestOfficers = getLatestTotal(stats.officersMetadata);



  return (
    <>
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
      <Header signInKey={t(header.signInKey)} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-0">
        <Main>
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
            checkLinkKey={t(hero.checkLinkKey)}
            checkLinkDialog={{
              mainDialog: {
                title: t(checkLinkDialog.mainDialog.titleKey),
                description: t(checkLinkDialog.mainDialog.descriptionKey),
                cancelBtn: t(checkLinkDialog.mainDialog.cancelBtnKey),
                checkLinkBtn: t(checkLinkDialog.mainDialog.checkLinkBtnKey),
              },
              successDialog: {
                title: t(checkLinkDialog.successDialog.titleKey),
                description: t(checkLinkDialog.successDialog.descriptionKey),
                doneBtn: t(checkLinkDialog.successDialog.doneBtnKey),
                visitLinkBtn: t(checkLinkDialog.successDialog.visitLinkBtnKey),
              },
              expiredDialog: {
                title: t(checkLinkDialog.expiredDialog.titleKey),
                description: t(checkLinkDialog.expiredDialog.descriptionKey),
                doneBtn: t(checkLinkDialog.expiredDialog.doneBtnKey),
              },
              notFoundDialog: {
                title: t(checkLinkDialog.notFoundDialog.titleKey),
                description: t(checkLinkDialog.notFoundDialog.descriptionKey),
                doneBtn: t(checkLinkDialog.notFoundDialog.doneBtnKey),
                reportBtn: t(checkLinkDialog.notFoundDialog.reportBtnKey),
                failedMsg: t(checkLinkDialog.notFoundDialog.failedMsgKey),
              },
              reportDialog: {
                title: t(checkLinkDialog.reportDialog.titleKey),
                description: t(checkLinkDialog.reportDialog.descriptionKey),
                doneBtn: t(checkLinkDialog.reportDialog.doneBtnKey),
              },
            }}
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
                  interval={2000}
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
          <StatsNew
            clicksMetadata={stats.clicksMetadata}
            linksMetadata={stats.linksMetadata}
            officersMetadata={stats.officersMetadata}
            title={t(statsTranslations.titleKey)}
            counterDailyKey={t(statsTranslations.counters.daily)}
            counterTotalKey={t(statsTranslations.counters.total)}
            dataAsOfKey={t(statsTranslations.counters.dataAsOf)}
            locale={locale}
            publicOfficersKey={t(statsTranslations.segments.publicOfficers)}
            linksCreatedKey={t(statsTranslations.segments.linksCreated)}
            clicksServedKey={t(statsTranslations.segments.clicksServed)}
          />
          <Action
            title={t(action.titleKey)}
            buttonText={t(action.buttonKey)}
            description={t.rich(action.descriptionKey, {
              em: (chunks) => (
                <AnimatedRoundedText
                  prefix={`${process.env.LANDING_DOMAIN || "https://pautan.org"}/`}
                  variant="primary"
                  items={SEGMENTS}
                  interval={2000}
                />
              ),
            })}
          />
        </Main>
      </div>
      <Footer
        ministry={extract(messages, "common.names.kd")}
        copyrightKey={t(footer.copyrightKey)}
        lastUpdateKey={t(footer.lastUpdateKey)}
        disclaimerKey={t(footer.disclaimerKey)}
        privacyPolicyKey={t(footer.privacyPolicyKey)}
        descriptionWithNewlines={extract(
          messages,
          "components.Footer.address",
        )}
        links={[
          {
            title: extract(messages, "components.Footer.links.title.openSource"),
            links: [
              {
                name: extract(messages, "components.Footer.links.name.figma"),
                href: URL_FIGMA,
              },
              {
                name: extract(messages, "components.Footer.links.name.github"),
                href: URL_GITHUB,
              },
            ],
          },
        ]}
      />
    </>
  );
}

function Main(props: { children: ReactNode }) {
  return (
    <main className="flex w-full flex-col divide-y divide-washed-100 lg:py-0">
      {React.Children.map(props.children, (child) => (
        <article>{child}</article>
      ))}
    </main>
  );
}

const header = {
  signInKey: keypath(HEADER_BASE_PATH, "buttons.signIn"),
};

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

const footer = {
  copyrightKey: keypath(FOOTER_BASE_PATH, "copyright"),
  lastUpdateKey: keypath(FOOTER_BASE_PATH, "last_update"),
  disclaimerKey: keypath(FOOTER_BASE_PATH, "disclaimer"),
  privacyPolicyKey: keypath(FOOTER_BASE_PATH, "privacy_policy"),
};

const hero = {
  titleKey: keypath(HERO_BASE_PATH, "title"),
  descriptionKey: keypath(HERO_BASE_PATH, "description"),
  signInKey: keypath(HERO_BASE_PATH, "signIn"),
  buttonKey: keypath(HERO_BASE_PATH, "buttons.createLink"),
  checkLinkKey: keypath(HERO_BASE_PATH, "buttons.checkLink"),
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
    dataAsOf: keypath(STATS_BASE_PATH, "counters.dataAsOf"),
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

const checkLinkDialog = {
  mainDialog: {
    titleKey: keypath("components.CheckLinkDialog.MainDialog.LinkCheckerTitle"),
    descriptionKey: keypath("components.CheckLinkDialog.MainDialog.LinkCheckerDescription"),
    cancelBtnKey: keypath("components.CheckLinkDialog.MainDialog.CancelBtn"),
    checkLinkBtnKey: keypath("components.CheckLinkDialog.MainDialog.CheckLinkBtn"),
  },
  successDialog: {
    titleKey: keypath("components.CheckLinkDialog.SuccessDialog.SuccessTitle"),
    descriptionKey: keypath("components.CheckLinkDialog.SuccessDialog.SuccessDescription"),
    doneBtnKey: keypath("components.CheckLinkDialog.SuccessDialog.DoneBtn"),
    visitLinkBtnKey: keypath("components.CheckLinkDialog.SuccessDialog.VisitLinkBtn"),
  },
  expiredDialog: {
    titleKey: keypath("components.CheckLinkDialog.ExpiredDialog.ExpiredTitle"),
    descriptionKey: keypath("components.CheckLinkDialog.ExpiredDialog.ExpiredDescription"),
    doneBtnKey: keypath("components.CheckLinkDialog.ExpiredDialog.DoneBtn"),
  },
  notFoundDialog: {
    titleKey: keypath("components.CheckLinkDialog.NotFoundDialog.NotFoundTitle"),
    descriptionKey: keypath("components.CheckLinkDialog.NotFoundDialog.NotFoundDescription"),
    doneBtnKey: keypath("components.CheckLinkDialog.NotFoundDialog.DoneBtn"),
    reportBtnKey: keypath("components.CheckLinkDialog.NotFoundDialog.ReportBtn"),
    failedMsgKey: keypath("components.CheckLinkDialog.NotFoundDialog.FailedMsg"),
  },
  reportDialog: {
    titleKey: keypath("components.CheckLinkDialog.ReportDialog.ReportTitle"),
    descriptionKey: keypath("components.CheckLinkDialog.ReportDialog.ReportDescription"),
    doneBtnKey: keypath("components.CheckLinkDialog.ReportDialog.DoneBtn"),
  },
};