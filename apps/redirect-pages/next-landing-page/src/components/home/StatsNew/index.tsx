"use client";

import Heading from "@/components/Heading";
import Section from "@/components/Section";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import SmoothLineChart from "@/components/charts/SmoothLineChart";
import LineChart from "@/components/charts/LineChart";
import RangeSlider from "./RangeSlider";
import { SliderProvider } from "./Slider";
import Timeseries from "./Timeseries";
import { ChartData } from "chart.js";

type MetadataItem = {
  date: string;
  total: number;
};

type Props = {
  clicksMetadata: MetadataItem[];
  linksMetadata: MetadataItem[];
  officersMetadata: MetadataItem[];
  title: string;
  counterDailyKey: string;
  counterTotalKey: string;
  dataAsOfKey: string;
  locale: string;
  publicOfficersKey: string;
  linksCreatedKey: string;
  clicksServedKey: string;
};

const getMonthYearString = (date: Date) => {
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

export default function StatsNew(props: Props) {
  const [selectedView, setSelectedView] = useState<'Daily' | 'Cumulative'>('Cumulative');
  
  // Get the date range from the data
  const earliestDate = useMemo(() => 
    new Date(Math.min(
      ...props.clicksMetadata.map(d => new Date(d.date).getTime()),
      ...props.linksMetadata.map(d => new Date(d.date).getTime()),
      ...props.officersMetadata.map(d => new Date(d.date).getTime())
    )), [props.clicksMetadata, props.linksMetadata, props.officersMetadata]);

  const latestDate = useMemo(() => 
    new Date(Math.max(
      ...props.clicksMetadata.map(d => new Date(d.date).getTime()),
      ...props.linksMetadata.map(d => new Date(d.date).getTime()),
      ...props.officersMetadata.map(d => new Date(d.date).getTime())
    )), [props.clicksMetadata, props.linksMetadata, props.officersMetadata]);

  // Initialize dateRange with full range
  const [dateRange, setDateRange] = useState<[Date, Date]>([earliestDate, latestDate]);

  // Update dateRange when props change
  useEffect(() => {
    setDateRange([earliestDate, latestDate]);
  }, [earliestDate, latestDate]);

  // Updated functions to respect date range
  const getLatestTotal = (metadata: MetadataItem[]) => {
    const filteredMetadata = metadata.filter(entry => {
      const date = new Date(entry.date);
      return date >= dateRange[0] && date <= dateRange[1];
    });
    
    if (filteredMetadata.length === 0) return 0;
    return filteredMetadata.reduce((latest, current) => 
      new Date(current.date) > new Date(latest.date) ? current : latest
    ).total;
  };

  const getLatestDaily = (metadata: MetadataItem[]) => {
    const filteredMetadata = metadata
      .filter(entry => {
        const date = new Date(entry.date);
        return date >= dateRange[0] && date <= dateRange[1];
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (filteredMetadata.length < 2) return 0;
    return filteredMetadata[0].total - filteredMetadata[1].total;
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
    return date.toLocaleString(props.locale, options).replace(',', '');
  };

  const handleRangeChange = (start: Date, end: Date) => {
    setDateRange([start, end]);
  };

  // Add this helper function to transform data for Timeseries
  const prepareChartData = (metadata: MetadataItem[], title: string) => {
    const filteredData = metadata
      .filter(entry => {
        const date = new Date(entry.date);
        return date >= dateRange[0] && date <= dateRange[1];
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      labels: filteredData.map(entry => entry.date),
      datasets: [{
        label: title,
        data: filteredData.map((entry, index, array) => 
          selectedView === 'Daily'
            ? (index === 0 ? entry.total : entry.total - array[index - 1].total)
            : entry.total
        ),
        fill: true,
        // Gradient
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          return gradient;
        },

        // Solid Color
        // backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(37, 99, 235)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      }]
    };
  };

  return (
    <Section className={cn("col-span-full", "px-4 md:px-6 lg:px-8", "overflow-hidden")}>
      <div className="relative w-full">
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
              className={cn("px-3 py-1 rounded-full", selectedView === 'Cumulative' ? "bg-gray-200" : "bg-transparent")}
              onClick={() => {
                setSelectedView('Cumulative');
              }}
            >
              {props.counterTotalKey}
            </button>
            <button 
              className={cn("px-3 py-1 rounded-full ml-2", selectedView === 'Daily' ? "bg-gray-200" : "bg-transparent")}
              onClick={() => {
                setSelectedView('Daily');
              }}
            >
              {props.counterDailyKey}
            </button>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            {props.dataAsOfKey} {formatDate(new Date())}
          </div>
        </div>

        <div className={cn(
          "grid gap-6",
          "grid-cols-1",
          "md:grid-cols-1",
          "lg:grid-cols-3"
        )}>
          {[
            { title: props.clicksServedKey, metadata: props.clicksMetadata },
            { title: props.linksCreatedKey, metadata: props.linksMetadata },
            { title: props.publicOfficersKey, metadata: props.officersMetadata }
          ].map((item, index) => {
            const chartData = prepareChartData(item.metadata, item.title);

            return (
              <div key={index} className="bg-white p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                 
                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{props.counterDailyKey}</p>
                    <p className="text-2xl font-bold">
                      +{formatNumber(getLatestDaily(item.metadata))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{props.counterTotalKey}</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(getLatestTotal(item.metadata))}
                    </p>
                  </div>
                </div>

                <SliderProvider>
                  {() => (
                    <div className={cn(
                      "mt-4",
                      "w-full",
                      "max-sm:h-[15.625rem]",
                      "md:h-[15.4375rem]",
                      "lg:h-[15.25rem]",
                      "bg-white"
                    )}>
                      <Timeseries
                        title={item.title}
                        key={`${item.title}-${selectedView}-${dateRange[0].getTime()}-${dateRange[1].getTime()}`}
                        className="w-full h-full"
                        // @ts-ignore
                        data={chartData as ChartData<"line", number[], string>}
                        enableGridX={false}
                        enableGridY={true}
                        enableAnimation={true}
                        tooltipCallback={(tooltipItem) => {
                          const date = new Date(tooltipItem.label);
                          return `${date.toLocaleString(props.locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}: ${formatNumber(tooltipItem.parsed.y)}`;
                        }}
                      />
                    </div>
                  )}
                </SliderProvider>
              </div>
            );
          })}
        </div>

        <div className="pt-8 relative w-full overflow-hidden">
          <RangeSlider
            key={`range-${earliestDate.toISOString()}-${latestDate.toISOString()}`}
            startDate={earliestDate}
            endDate={latestDate}
            initialStart={dateRange[0]}
            initialEnd={dateRange[1]}
            onChange={handleRangeChange}
            locale={props.locale}
          />
        </div>
      </div>
    </Section>
  );
}

function StatLabel(props: { text: string; className?: string }) {
  return <div className="text-dim-500">{props.text}</div>;
}
