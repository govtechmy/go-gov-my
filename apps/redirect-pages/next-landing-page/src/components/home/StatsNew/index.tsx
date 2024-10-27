"use client";

import Heading from "@/components/Heading";
import Section from "@/components/Section";
import { cn } from "@/lib/utils";
import { useState } from "react";
import SmoothLineChart from "@/components/charts/SmoothLineChart";
import LineChart from "@/components/charts/LineChart";
import DateRangeSlider from "./DateRangeSlider";

type MetadataItem = {
  date: string;
  total: number;
};

type Props = {
  clicksMetadata: MetadataItem[];
  linksMetadata: MetadataItem[];
  officersMetadata: MetadataItem[];
  title: string;
};

const getMonthYearString = (date: Date) => {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export default function StatsNew(props: Props) {
  // Calculate earliest and latest dates from all metadata
  const allDates = [
    ...props.clicksMetadata.map(item => new Date(item.date)),
    ...props.linksMetadata.map(item => new Date(item.date)),
    ...props.officersMetadata.map(item => new Date(item.date))
  ];

  const earliestDate = new Date(Math.min(...allDates.map(date => date.getTime())));
  const latestDate = new Date(Math.max(...allDates.map(date => date.getTime())));

  const [selectedView, setSelectedView] = useState<'Daily' | 'Cumulative'>('Daily');
  const [dateRange, setDateRange] = useState<[Date, Date]>([earliestDate, latestDate]);

  const getLatestTotal = (metadata: MetadataItem[]) => {
    if (metadata.length === 0) return 0;
    return metadata.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    ).total;
  };

  const getLatestDaily = (metadata: MetadataItem[]) => {
    if (metadata.length < 2) return 0;
    const sortedMetadata = metadata.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sortedMetadata[0].total - sortedMetadata[1].total;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

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

  const handleRangeChange = (start: Date, end: Date) => {
    setDateRange([start, end]);
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
          Data as of {formatDate(new Date())}
        </div>
      </div>

      <div className={cn(
        "grid gap-6",
        "grid-cols-1",
        "md:grid-cols-1",
        "lg:grid-cols-3"
      )}>
        {[
          { title: "Clicks Served", metadata: props.clicksMetadata },
          { title: "Links Created", metadata: props.linksMetadata },
          { title: "Public Officers", metadata: props.officersMetadata }
        ].map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Daily</p>
                <p className="text-2xl font-bold">+{formatNumber(getLatestDaily(item.metadata))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{formatNumber(getLatestTotal(item.metadata))}</p>
              </div>
            </div>
            <div className={cn(
              "mt-4",
              "w-full",
              "max-sm:h-[15.625rem]",
              "md:h-[15.4375rem]",
              "lg:h-[15.25rem]",
              "bg-white",
              // "rounded-lg",
              // "overflow-hidden"
            )}>
              <LineChart
                className="w-full h-full"
                data={item.metadata
                  .filter(entry => {
                    const date = new Date(entry.date);
                    return date >= dateRange[0] && date <= dateRange[1];
                  })
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((entry, index, array) => {
                    const dailyValue = index > 0 
                      ? Math.max(0, entry.total - array[index - 1].total)
                      : entry.total;
                    
                    return {
                      date: new Date(entry.date),
                      value: selectedView === 'Daily' ? dailyValue : entry.total
                    };
                  })
                }
                animationDurationMs={1000}
              />
            </div>
          </div>
        ))}
      </div>
     {/* <div className="pt-8">
       <DateRangeSlider
        startDate={earliestDate}
        endDate={latestDate}
        onRangeChange={handleRangeChange}
      />
     </div> */}
    </Section>
  );
}

function StatLabel(props: { text: string; className?: string }) {
  return <div className="text-dim-500">{props.text}</div>;
}
