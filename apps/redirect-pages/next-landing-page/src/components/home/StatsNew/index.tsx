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
import StatDropdown from "@/components/home/Stats/StatDropdown";
import StatGroup from "@/components/home/Stats/StatGroup";
import StatNumber from "@/components/home/Stats/StatNumber";
import StatTag from "@/components/home/Stats/StatTag";
import { Item as StatDropdownItem } from "@/components/Dropdown";
import SmoothLineChart from "@/components/charts/SmoothLineChart";

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
  const [selectedView, setSelectedView] = useState<'Daily' | 'Cumulative'>('Daily');
  const currentDate = new Date();

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

  // Function to format date without date-fns
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return date.toLocaleString('en-US', options).replace(',', '');
  };

  return (
    <Section className={cn("col-span-full", "px-4 md:px-6 lg:px-8")}>
      <div className="col-span-full flex flex-col items-center mb-4">
        <img
          src="/logo.svg"
          width={32}
          height={32}
          alt="logo"
          className={cn("object-contain")}
        />
      </div>
      <div className="col-span-full mt-[1.125rem] flex flex-col items-center mb-12">
        <Heading level={2} className="text-center">
          {props.title}
        </Heading>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <button 
            className={cn("px-3 py-1 rounded-full", selectedView === 'Daily' ? "bg-gray-200" : "bg-transparent")}
            onClick={() => setSelectedView('Daily')}
          >
            Daily
          </button>
          <button 
            className={cn("px-3 py-1 rounded-full ml-2", selectedView === 'Cumulative' ? "bg-gray-200" : "bg-transparent")}
            onClick={() => setSelectedView('Cumulative')}
          >
            Cumulative
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Data as of {formatDate(currentDate)}
        </div>
      </div>

      <div className={cn(
        "grid gap-6",
        "grid-cols-1",
        "md:grid-cols-1",
        "lg:grid-cols-3"
      )}>
        {[
          { title: "Clicks Served", daily: "+733", total: "313,352" },
          { title: "Links Created", daily: "+231", total: "78,828" },
          { title: "Public Officers", daily: "+11", total: "313,352" }
        ].map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Daily</p>
                <p className="text-2xl font-bold">{item.daily}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{item.total}</p>
              </div>
            </div>
            <div className={cn(
                "mt-[2rem]",
                "max-sm:h-[15.625rem]",
                "md:h-[23.4375rem]", // Increase height for tablet
                "lg:h-[31.25rem]",  // Return to original height for desktop
                "w-full"    // Ensure full width
            )}>
              <SmoothLineChart
                // className="w-full h-full"
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
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">2020</div>
        <div className="flex-1 mx-4 h-1 bg-gray-300 rounded-full">
          <div className="w-1/2 h-full bg-blue-500 rounded-full"></div>
        </div>
        <div className="text-sm">2023</div>
      </div>
    </Section>
  );
}

function StatLabel(props: { text: string; className?: string }) {
  return <div className="text-dim-500">{props.text}</div>;
}
