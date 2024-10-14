"use client";

import Heading from "@/components/Heading";
import Section from "@/components/Section";
import SegmentButton from "@/components/SegmentButton";
import LineChart from "@/components/charts/LineChart";
import IconCursor from "@/icons/cursor";
import IconLink from "@/icons/link";
import IconPeople from "@/icons/people";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import StatDropdown from "./StatDropdown";
import StatGroup from "./StatGroup";
import StatNumber from "./StatNumber";
import StatTag from "./StatTag";
import { Item as StatDropdownItem } from "@/components/Dropdown";

type Props = {
  total: {
    users: number;
    links: number;
    clicks: number;
  };
  title: string;
  segments: {
    publicOfficers: string;
    linksCreated: string;
    clicksServed: string;
  };
  counters: {
    daily: string;
    total: string;
  };
  className?: string;
  dropdown: {
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
  };
};

const SEGMENT_PUBLIC_OFFICERS = 0;
const SEGMENT_LINKS_CREATED = 1;
const SEGMENT_CLICKS_SERVED = 2;

const segments = [
  {
    key: "publicOfficers" as keyof Props['segments'],
    value: SEGMENT_PUBLIC_OFFICERS,
  },
  {
    key: "linksCreated" as keyof Props['segments'],
    value: SEGMENT_LINKS_CREATED,
  },
  {
    key: "clicksServed" as keyof Props['segments'],
    value: SEGMENT_CLICKS_SERVED,
  },
];

export default function Stats(props: Props) {
  const t = useTranslations();
  const [currentSegment, setCurrentSegment] = useState(SEGMENT_PUBLIC_OFFICERS);
  const [selectedDropdownItem, setSelectedDropdownItem] = useState<string>("daily");

  const data = {
    publicOfficers: props.total.users,
    linksCreated: props.total.links,
    clicksServed: props.total.clicks,
  };

  const [counters, setCounters] = useState([
    {
      name: t("pages.Home.Stats.counters.daily"),
      count: 2784,
      prefix: "+",
    },
    {
      name: t("pages.Home.Stats.counters.total"),
      count: 126265,
    },
  ]);

  return (
    <Section
      className={cn(
        "col-rows-5",
        "md:max-lg:mx-auto md:max-lg:w-[600px]",
        "md:px-0",
        "grid grid-cols-12",
        props.className,
      )}
    >
      <div className="col-span-full flex flex-col items-center">
        <img
          src="/logo.svg"
          width={32}
          height={32}
          alt="logo"
          className={cn("object-contain")}
        />
      </div>
      <div className="col-span-full mt-[1.125rem] flex flex-col items-center">
        <Heading level={2} className="text-center">
          {props.title}
        </Heading>
      </div>
      <div
        className={cn(
          "col-span-full",
          "lg:col-start-2 lg:col-end-12",
          "mt-[2rem] md:mt-[3rem]",
          "grid grid-cols-12",
        )}
      >
        <div
          className={cn(
            "col-span-full",
            "mx-auto",
            "grid grid-cols-2 grid-rows-2 md:grid-cols-3 md:grid-rows-1",
            "gap-[1.5rem] md:gap-x-[3rem] lg:gap-x-[4rem]",
          )}
        >
          <StatGroup className={cn("col-start-1 col-end-2")}>
            <StatTag
              icon={<IconPeople />}
              text={props.segments?.publicOfficers || ''}
            />
            <StatNumber
              size="large"
              number={data.publicOfficers}
              className={cn("ml-[1.5rem] md:ml-0")}
            />
          </StatGroup>
          <StatGroup className={cn("col-start-2 col-end-3 row-start-1")}>
            <StatTag
              icon={<IconLink />}
              text={props.segments?.linksCreated || ''}
            />
            <StatNumber
              size="large"
              number={data.linksCreated}
              className={cn("ml-[1.5rem] md:ml-0")}
            />
          </StatGroup>
          <StatGroup
            className={cn(
              "col-start-1 col-end-2 md:col-start-3 md:col-end-4",
              "row-start-2 md:row-start-1",
            )}
          >
            <StatTag
              icon={<IconCursor />}
              text={props.segments?.clicksServed || ''}
            />
            <StatNumber
              size="large"
              number={data.clicksServed}
              className={cn(
                "mt-[0.25rem] lg:mt-[0.5rem]",
                "ml-[1.5rem] md:ml-0",
              )}
            />
          </StatGroup>
        </div>
        <div className={cn("col-span-full", "mt-[3rem]")}>
          <div className={cn("flex flex-row items-center")}>
            <div className={cn("flex flex-row items-center")}>
              {segments.map((segment) => (
                <SegmentButton
                  key={segment.value}
                  selected={currentSegment === segment.value}
                  onClick={() => setCurrentSegment(segment.value)}
                >
                  {props.segments[segment.key]}
                </SegmentButton>
              ))}
            </div>
            <StatDropdown 
              className="ml-auto" 
              dropdownItems={props.dropdown} 
              selectedItem={selectedDropdownItem}
              onSelectionChange={(item: StatDropdownItem) => setSelectedDropdownItem(item.id)}
            />
          </div>
          <div
            className={cn(
              "mt-[2rem]",
              "flex flex-row flex-nowrap items-center",
            )}
          >
            {counters.map((counter, i) => (
              <div
                className={cn(
                  "p-[1rem]",
                  "flex flex-col items-start",
                  i > 0 && "ml-[2.5rem]",
                )}
                key={i}
              >
                <StatLabel className="text-sm" text={counter.name === 'daily' ? props.counters.daily : props.counters.total}></StatLabel>
                <StatNumber
                  size="small"
                  prefix={counter.prefix}
                  number={counter.count}
                />
              </div>
            ))}
          </div>
          <LineChart
            className={cn(
              "mt-[2rem]",
              "w-full max-sm:h-[15.625rem] md:h-[23.4375rem] lg:h-[31.25rem]",
            )}
            data={[
              { date: new Date("2023-12-01T00:00:00Z"), value: 12345 },
              { date: new Date("2024-01-02T00:00:00Z"), value: 90112 },
              { date: new Date("2024-01-03T00:00:00Z"), value: 11444 },
              { date: new Date("2024-01-04T00:00:00Z"), value: 123555 },
              { date: new Date("2024-01-05T00:00:00Z"), value: 16777 },
              { date: new Date("2023-01-06T00:00:00Z"), value: 12345 },
              { date: new Date("2024-01-07T00:00:00Z"), value: 90112 },
              { date: new Date("2023-01-08T00:00:00Z"), value: 123456 },
              { date: new Date("2024-01-09T00:00:00Z"), value: 90112 },
              { date: new Date("2024-01-10T00:00:00Z"), value: 11444 }
            ]}
          ></LineChart>
        </div>
      </div>
    </Section>
  );
}

function StatLabel(props: { text: string; className?: string }) {
  return <div className="text-dim-500">{props.text}</div>;
}
