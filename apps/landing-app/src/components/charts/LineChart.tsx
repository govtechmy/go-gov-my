import { formatDate, formatResponsiveDate } from '@/lib/d3';
import { formatBigNumber, getStylizedNumber } from '@/lib/number';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

// Update the Props and DataPoint types
type Props = {
  data: DataPoint[];
  animationDurationMs?: number;
  className?: string;
};

type DataPoint = {
  date: Date;
  value: number;
};

const TOOLTIP_HEIGHT = 50;
const TOOLTIP_WIDTH = 90;
const AXIS_LABEL_FONT_SIZE = 12;
const AXIS_LABEL_LINE_HEIGHT = 16;

const labelVariants = cva('text-outline-400 text-[0.75rem] font-body');

// TODO: Refactor to make it more reusable and responsive
export default function LineChart(props: Props) {
  const { data } = props;
  const ref = useRef<SVGSVGElement | null>(null);
  const { ref: inViewRef, inView } = useInView({
    trackVisibility: true,
    delay: 100,
  });
  const [resizeObserver, setResizeObserver] = useState<ResizeObserver | null>(null);
  const [paddingLeft, setPaddingLeft] = useState(0);

  function draw() {
    const rect = ref.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    const { width: w, height: h } = rect;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', w)
      .attr('height', h)
      .attr('viewBox', `0 0 ${w} ${h}`)
      .style('overflow', 'visible');

    const xScale = d3
      .scalePoint()
      // @ts-ignore
      .domain(data.map((d) => d.date))
      .range([0, w]);

    // Get the largest value from the data for the end of domain
    const yScale = d3
      .scaleLinear()
      // @ts-ignore
      .domain([0, d3.max(data, (d) => d.value)])
      .range([h, 0]);

    // Custom date format with spaced ticks
    const xAxis = d3
      .axisBottom(xScale)
      .tickSize(10)
      .tickPadding(15)
      // @ts-ignore
      .tickValues(
        (() => {
          const domain = xScale.domain() as unknown as Date[];
          const step = Math.ceil(domain.length / 6);
          const filteredDomain = domain.filter((_, i) => i % step === 0);
          return Array.from(new Set([...filteredDomain, domain[domain.length - 1]]));
        })()
      )
      .tickFormat((d) => {
        const date = d as unknown as Date;
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });

        // Check if this is the last date in the domain
        const domain = xScale.domain() as unknown as Date[];
        const isLastDate = date.getTime() === domain[domain.length - 1].getTime();

        // If it's the last date and there's a date right before it that shows the month
        const prevDate = domain[domain.indexOf(date) - 1];

        return `${month} ${day}`;
      });

    // @ts-ignore
    const yAxis = d3
      .axisLeft(yScale)
      .tickSize(0)
      .tickPadding(10)
      .tickFormat((d, i) => formatBigNumber(d));

    const xAxisGroup = svg
      .append('g')
      .call(xAxis)
      .attr('font-size', AXIS_LABEL_FONT_SIZE)
      .attr('height', AXIS_LABEL_LINE_HEIGHT)
      .attr('transform', `translate(0, ${h})`)
      .attr('strokeWidth', 0.25)
      .attr('class', cn('x-axis', labelVariants()));

    svg
      .append('g')
      // @ts-ignore
      .call(yAxis)
      .attr('font-size', AXIS_LABEL_FONT_SIZE)
      .attr('height', AXIS_LABEL_LINE_HEIGHT)
      .attr('transform', 'translate(0, 0)')
      .attr('strokeWidth', 0.25)
      .attr('stroke-dasharray', '8,4')
      .attr('class', cn('y-axis', labelVariants()));

    const maxYAxisLabelWidth = d3.max(
      d3.selectAll('.y-axis text').nodes(),
      // @ts-ignore
      (d) => d.getBBox().width
    );

    setPaddingLeft(maxYAxisLabelWidth);

    // @ts-ignore
    const area = d3
      .area()
      // @ts-ignore
      .x((d) => xScale(d.date))
      .y0(h)
      // @ts-ignore
      .y1((d) => yScale(d.value));

    // Define the area gradient
    const defs = svg.append('defs');
    const gradient = defs
      .append('linearGradient')
      .attr('id', 'gradient')
      .attr('x1', '0%')
      .attr('x2', '0%')
      .attr('y1', '0%')
      .attr('y2', '100%');

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', `rgb(var(--brand-600)`)
      .attr('stop-opacity', 0.2);

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'white')
      .attr('stop-opacity', 0);

    // Add the area gradient
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'url(#gradient)')
      // @ts-ignore
      .attr('d', area);

    // @ts-ignore
    const line = d3
      .line()
      // @ts-ignore
      .x((d) => xScale(d.date))
      // @ts-ignore
      .y((d) => yScale(d.value));

    const linePath = svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('strokeWidth', 2)
      .attr('stroke', 'rgb(var(--brand-600))')
      // @ts-ignore
      .attr('d', line);

    // Animate
    // @ts-ignore
    const totalLength = linePath.node().getTotalLength();

    linePath
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(props.animationDurationMs || 1000) // Animation duration in ms
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    const verticalLine = svg
      .append('line')
      .attr('class', 'vertical-line')
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '8,4')
      .attr('y1', 0)
      .attr('y2', h)
      .style('display', 'none');

    const tooltip = svg.append('g').attr('class', 'tooltip').style('display', 'none');

    tooltip
      .append('rect')
      .attr('width', TOOLTIP_WIDTH)
      .attr('height', TOOLTIP_HEIGHT)
      .attr('x', 0)
      .attr('y', 0)
      .attr('fill', 'white')
      .attr('radius', '4')
      .attr('stroke', 'rgb(var(--outline-400))')
      .attr('strokeWidth', 1)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('class', 'tooltip-background');

    const tooltipText = tooltip
      .append('text')
      .attr('class', 'tooltip-text')
      .attr('dominant-baseline', 'middle')
      .attr('x', 0)
      .attr('y', 0);

    // Event handlers
    svg
      .on('mousemove', function onMouseMove(event) {
        const [mouseX] = d3.pointer(event);

        // Find the closest x value in the domain
        const xDate = xScale.domain().reduce((prev, curr) => {
          const prevDiff = Math.abs(xScale(prev)! - mouseX);
          const currDiff = Math.abs(xScale(curr)! - mouseX);
          return currDiff < prevDiff ? curr : prev;
        });

        // Find the corresponding data point
        const point = data.find((d) => d.date.getTime() === (xDate as unknown as Date).getTime());

        if (point) {
          // Move vertical line
          verticalLine
            .attr('x1', xScale(point.date as unknown as string)!)
            .attr('x2', xScale(point.date as unknown as string)!)
            .style('display', 'inline');

          // Update tooltip
          tooltip.style('display', 'inline').attr('transform', () => {
            const x =
              xScale(point.date as unknown as string)! >= w - TOOLTIP_WIDTH
                ? xScale(point.date as unknown as string)! - 10 - TOOLTIP_WIDTH
                : xScale(point.date as unknown as string)! + 10;

            const y =
              yScale(point.value) - TOOLTIP_HEIGHT < 0
                ? yScale(point.value) + 40
                : yScale(point.value) - 40;

            return `translate(${x}, ${y})`;
          });

          const lines = [
            {
              text: new Date(point.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
              styles: {
                fontSize: 12,
                height: 18,
                weight: '400',
                strokeColor: 'rgb(var(--brand-600)',
              },
            },
            {
              text: getStylizedNumber(point.value),
              styles: {
                fontSize: 16,
                height: 24,
                weight: '500',
                strokeColor: 'rgb(var(--black-900)',
              },
            },
          ];

          // Update tooltip text
          tooltipText
            .selectAll('tspan')
            .data(lines.map((line) => line.text))
            .join('tspan')
            .attr('x', 8)
            .attr('dy', (d, i) => (i === 0 ? 16 : 24))
            .attr('stroke', (d, i) => lines[i].styles.strokeColor)
            .attr('font-weight', (d, i) => lines[i].styles.weight)
            .attr('font-size', (d, i) => lines[i].styles.fontSize)
            .text((d) => d);
        } else {
          verticalLine.style('display', 'none');
          tooltip.style('display', 'none');
        }
      })
      .on('mouseleave', function onMouseLeave() {
        // verticalLine.attr("x1", null).attr("x2", null);
        verticalLine.style('display', 'none');
        tooltip.style('display', 'none');
      });
  }

  function observe() {
    // Will trigger once upon initialization
    const observer = new ResizeObserver(draw);
    observer.observe(ref.current!);
    setResizeObserver(observer);
  }

  useEffect(draw, [props.data]);

  useEffect(() => {
    if (inView && resizeObserver == null) {
      observe();
    }
  }, [inView]);

  useEffect(() => {
    // Pass the ref to inView observer
    inViewRef(ref.current);

    return () => {
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <>
      <svg
        ref={ref}
        style={{
          // Offseting long labels
          paddingLeft: `${paddingLeft}px`,
          boxShadow: 'none',
        }}
        className={cn('min-h-[15.625rem] min-w-[18.75rem]', props.className)}
      ></svg>
    </>
  );
}
