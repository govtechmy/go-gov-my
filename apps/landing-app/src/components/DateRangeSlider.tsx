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
  const [hoveredHandle, setHoveredHandle] = useState<'start' | 'end' | null>(null);

  const updateSlider = () => {
    if (!sliderRef.current) return;

    // Clear previous content
    const svg = d3.select(sliderRef.current);
    svg.selectAll("*").remove();

    // Calculate responsive dimensions
    const containerWidth = sliderRef.current.clientWidth;
    const margin = { 
      left: Math.max(30, containerWidth * 0.05), 
      right: Math.max(30, containerWidth * 0.05) 
    };
    const width = containerWidth - margin.left - margin.right;
    const height = 48;

    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, width]);

    const sliderGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${height/2})`);

    // Background track (gray)
    sliderGroup.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", "rgb(229 231 235)") // Light gray
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round");

    // Selected range track (darker gray)
    const selectedTrack = sliderGroup.append("line")
      .attr("stroke", "rgb(59 130 246)") // Blue when hovered, darker gray otherwise
      .attr("stroke-width", 4)
      .attr("stroke-linecap", "round");

    // Tooltip
    const tooltip = sliderGroup.append("g")
      .attr("class", "tooltip")
      .style("display", "none");

    tooltip.append("rect")
      .attr("width", 100)
      .attr("height", 30)
      .attr("fill", "black")
      .attr("rx", 4);

    const tooltipText = tooltip.append("text")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("y", 15)
      .attr("x", 50);

    // Create handles
    const startHandle = sliderGroup.append("g")
      .attr("class", "handle start-handle")
      .style("cursor", "pointer");

    const endHandle = sliderGroup.append("g")
      .attr("class", "handle end-handle")
      .style("cursor", "pointer");

    startHandle.append("circle")
      .attr("r", 8)
      .attr("fill", "white")
      .attr("stroke", "rgb(59 130 246)")
      .attr("stroke-width", 2);

    endHandle.append("circle")
      .attr("r", 8)
      .attr("fill", "white")
      .attr("stroke", "rgb(59 130 246)")
      .attr("stroke-width", 2);

    // Year labels
    sliderGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("text-anchor", "start")
      .text("2023")
      .attr("fill", "rgb(107 114 128)");

    sliderGroup.append("text")
      .attr("x", width)
      .attr("y", 30)
      .attr("text-anchor", "end")
      .text("2024")
      .attr("fill", "rgb(107 114 128)");

    function updateHandles() {
      const startX = xScale(selectedRange[0]);
      const endX = xScale(selectedRange[1]);

      startHandle.attr("transform", `translate(${startX}, 0)`);
      endHandle.attr("transform", `translate(${endX}, 0)`);

      selectedTrack
        .attr("x1", startX)
        .attr("x2", endX)
        .attr("stroke", hoveredHandle ? "rgb(59 130 246)" : "rgb(156 163 175)"); // Blue when hovered, darker gray otherwise

      // Update tooltip
      if (hoveredHandle) {
        const hoveredDate = hoveredHandle === 'start' ? selectedRange[0] : selectedRange[1];
        const hoveredX = hoveredHandle === 'start' ? startX : endX;
        
        tooltip
          .style("display", "block")
          .attr("transform", `translate(${hoveredX - 50}, -45)`);
        
        tooltipText.text(d3.timeFormat("%d %b %Y")(hoveredDate));
      } else {
        tooltip.style("display", "none");
      }
    }

    // Separate drag behaviors
    const dragStart = d3.drag<SVGGElement, unknown>()
      .on("drag", function(event) {
        const newX = Math.max(0, Math.min(xScale(selectedRange[1]) - 1, event.x));
        const newDate = xScale.invert(newX);
        selectedRange[0] = newDate;
        setSelectedRange([...selectedRange]);
        onRangeChange(selectedRange[0], selectedRange[1]);
        updateHandles();
      });

    const dragEnd = d3.drag<SVGGElement, unknown>()
      .on("drag", function(event) {
        const newX = Math.max(xScale(selectedRange[0]) + 1, Math.min(width, event.x));
        const newDate = xScale.invert(newX);
        selectedRange[1] = newDate;
        setSelectedRange([...selectedRange]);
        onRangeChange(selectedRange[0], selectedRange[1]);
        updateHandles();
      });

    // Apply interactions
    startHandle
      .call(dragStart)
      .on("mouseenter", () => {
        setHoveredHandle('start');
        updateHandles();
      })
      .on("mouseleave", () => {
        setHoveredHandle(null);
        updateHandles();
      });

    endHandle
      .call(dragEnd)
      .on("mouseenter", () => {
        setHoveredHandle('end');
        updateHandles();
      })
      .on("mouseleave", () => {
        setHoveredHandle(null);
        updateHandles();
      });

    updateHandles();
  };

  useEffect(() => {
    updateSlider();

    // Add resize listener
    const handleResize = () => {
      updateSlider();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [startDate, endDate, selectedRange, hoveredHandle]);

  return (
    <div className="mt-8 w-full">
      <svg
        ref={sliderRef}
        className={cn("w-full")}
        height={80}
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
