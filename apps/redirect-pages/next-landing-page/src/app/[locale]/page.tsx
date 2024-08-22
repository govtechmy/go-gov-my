import AnimatedRoundedText from "@/components/AnimatedRoundedText";
import Action from "@/components/home/Action";
import Hero from "@/components/home/Hero";
import Preview from "@/components/home/Preview";
import Stats from "@/components/home/Stats";
import { keypath } from "@/lib/i18n";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React, { ReactNode } from "react";

type Props = {
  params: { locale: string };
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
  "dsd",
  "mohr",
  "motac",
  "epf",
  "mof",
  "mcmc",
];
const ACTION_BASE_PATH = "pages.Home.Action";
const PREVIEW_BASE_PATH = "pages.Home.Preview";

async function getStats() {
  const url = process.env.LANDING_STATS_JSON_URL;

  if (!url) {
    throw new Error("LANDING_STATS_JSON_URL is not set");
  }

  const response = await fetch(url);

  return (await response.json()) as StatsJson;
}

export default async function Home({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();
  const stats = await getStats();

  return (
    <Main>
      <Hero />
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
              items={SEGMENTS.map((segment) => `@${segment}`)}
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
      />
      <Action
        title={t(action.titleKey)}
        description={t.rich(action.descriptionKey, {
          em: (chunks) => (
            <AnimatedRoundedText
              prefix="go.gov.my/"
              variant="primary"
              items={SEGMENTS}
            />
          ),
        })}
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
};
