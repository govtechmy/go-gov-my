import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { Area, AreaClosed, Circle } from '@visx/shape';
import { motion } from 'framer-motion';
import { Fragment, useMemo } from 'react';
import { useChartContext, useChartTooltipContext } from './chart-context';

export default function Areas() {
  const { data, series, margin, xScale, yScale, startDate, endDate } = useChartContext();
  const { tooltipData } = useChartTooltipContext();

  // Return null if no data or missing required props
  if (!data || data.length === 0 || !startDate || !endDate) {
    return null;
  }

  // Data with all values set to zero to animate from
  const zeroedData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      values: Object.fromEntries(Object.keys(d.values).map((key) => [key, 0])),
    })) as typeof data;
  }, [data]);

  // Generate a safe key that handles undefined dates
  const getFragmentKey = (seriesId: string) => {
    const start = startDate?.toString() || 'start';
    const end = endDate?.toString() || 'end';
    return `${seriesId}_${start}_${end}`;
  };

  return (
    <Group left={margin.left} top={margin.top}>
      {series.map((s) => (
        <Fragment key={getFragmentKey(s.id)}>
          {/* Area background gradient */}
          <LinearGradient
            className="text-blue-500"
            id={`${s.id}-background`}
            fromOffset="20%"
            from="currentColor"
            fromOpacity={0.01}
            to="currentColor"
            toOpacity={0.2}
            x1={0}
            x2={0}
            y1={1}
          />

          {/* Area */}
          <AreaClosed
            data={data}
            x={(d) => xScale(d.date)}
            y={(d) => yScale(s.valueAccessor(d) ?? 0)}
            yScale={yScale}
          >
            {({ path }) => {
              return (
                <motion.path
                  initial={{ d: path(zeroedData) || '', opacity: 0 }}
                  animate={{ d: path(data) || '', opacity: 1 }}
                  fill={`url(#${s.id}-background)`}
                />
              );
            }}
          </AreaClosed>

          {/* Line */}
          <Area data={data} x={(d) => xScale(d.date)} y={(d) => yScale(s.valueAccessor(d) ?? 0)}>
            {({ path }) => (
              <motion.path
                initial={{ d: path(zeroedData) || '' }}
                animate={{ d: path(data) || '' }}
                className="text-blue-700"
                stroke="currentColor"
                strokeOpacity={0.8}
                strokeWidth={2}
                fill="transparent"
              />
            )}
          </Area>

          {/* Latest value dot - with null check */}
          {!tooltipData && data.length > 0 && (
            <Circle
              cx={xScale(data.at(-1)!.date)}
              cy={yScale(s.valueAccessor(data.at(-1)!))}
              r={4}
              className="text-blue-700"
              fill="currentColor"
            />
          )}
        </Fragment>
      ))}
    </Group>
  );
}
