import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';

type Props = {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
};

export default function DateRangeSlider({ startDate, endDate, onRangeChange }: Props) {
  const sliderRef = useRef<SVGSVGElement>(null);
  const [selectedRange, setSelectedRange] = useState<[Date, Date]>([startDate, endDate]);

  useEffect(() => {
    if (!sliderRef.current) return;

    const margin = { left: 10, right: 10 };
    const width = sliderRef.current.clientWidth - margin.left - margin.right;
    const height = 48;

    const svg = d3.select(sliderRef.current);
    svg.selectAll("*").remove();

    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, width]);

    // Create the slider track
    const track = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${height/2})`);

    // Add the background track
    track.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", "rgb(229 231 235)") // gray-200
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round");

    // Add the selected range track
    const selectedTrack = track.append("line")
      .attr("stroke", "rgb(59 130 246)") // blue-500
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round");

    // Add handles
    const handles = track.selectAll(".handle")
      .data([selectedRange[0], selectedRange[1]])
      .enter()
      .append("circle")
      .attr("class", "handle")
      .attr("r", 8)
      .attr("fill", "white")
      .attr("stroke", "rgb(59 130 246)")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer");

    // Add date labels
    const dateFormat = d3.timeFormat("%d %b %Y");
    const labels = track.selectAll(".label")
      .data([selectedRange[0], selectedRange[1]])
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("fill", "rgb(107 114 128)") // gray-500
      .attr("font-size", "12px");

    function updateHandles() {
      handles.attr("cx", (d: Date) => xScale(d));
      selectedTrack
        .attr("x1", xScale(selectedRange[0]))
        .attr("x2", xScale(selectedRange[1]));
      labels
        .attr("x", (d: Date) => xScale(d))
        .text((d: Date) => dateFormat(d));
    }

    const drag = d3.drag<SVGCircleElement, Date>()
      .on("drag", function(event, d) {
        const index = selectedRange[0] === d ? 0 : 1;
        const newDate = xScale.invert(event.x);
        
        // Ensure handles don't cross and stay within bounds
        if (index === 0) {
          if (newDate < startDate) return;
          if (newDate >= selectedRange[1]) return;
          selectedRange[0] = newDate;
        } else {
          if (newDate > endDate) return;
          if (newDate <= selectedRange[0]) return;
          selectedRange[1] = newDate;
        }
        
        setSelectedRange([...selectedRange]);
        onRangeChange(selectedRange[0], selectedRange[1]);
        updateHandles();
      });

    handles.call(drag);
    updateHandles();
  }, [startDate, endDate, selectedRange]);

  return (
    <div className="mt-8">
      <svg
        ref={sliderRef}
        className={cn("w-full")}
        height={48}
      />
    </div>
  );
}