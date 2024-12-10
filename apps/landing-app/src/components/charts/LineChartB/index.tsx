'use client';

import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './radix';
const chartData = [
  { date: new Date('2023-12-01T00:00:00Z'), value: 12345 },
  { date: new Date('2024-01-02T00:00:00Z'), value: 90112 },
  { date: new Date('2024-01-03T00:00:00Z'), value: 11444 },
  { date: new Date('2024-01-04T00:00:00Z'), value: 123555 },
  { date: new Date('2024-01-05T00:00:00Z'), value: 16777 },
];

const chartConfig = {
  value: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function LineChartB() {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => value.toLocaleDateString()}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Line
          dataKey="value"
          type="linear"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
