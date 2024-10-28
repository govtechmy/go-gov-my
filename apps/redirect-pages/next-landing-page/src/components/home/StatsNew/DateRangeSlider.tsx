import { useState, useRef } from 'react';

type Props = {
  startDate: Date;
  endDate: Date;
  initialStart: Date;
  initialEnd: Date;
  onChange: (start: Date, end: Date) => void;
};

export default function DateRangeSlider({ 
  startDate, 
  endDate, 
  initialStart,
  initialEnd,
  onChange 
}: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (date: Date) => {
    const total = endDate.getTime() - startDate.getTime();
    return ((date.getTime() - startDate.getTime()) / total) * 100;
  };

  const [start, setStart] = useState<number>(() => getPercentage(initialStart));
  const [end, setEnd] = useState<number>(() => getPercentage(initialEnd));
  const [activeThumb, setActiveThumb] = useState<'start' | 'end' | null>(null);
  const [showStartPopover, setShowStartPopover] = useState(false);
  const [showEndPopover, setShowEndPopover] = useState(false);

  const percentToDate = (percent: number): Date => {
    const totalTime = endDate.getTime() - startDate.getTime();
    const time = startDate.getTime() + (totalTime * percent / 100);
    return new Date(time);
  };

  const handleMouseDown = (thumb: 'start' | 'end') => {
    setActiveThumb(thumb);
  };

  const handleMouseUp = () => {
    setActiveThumb(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sliderRef.current || !activeThumb) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = (offsetX / rect.width) * 100;

    if (activeThumb === 'start' && percent < end) {
      setStart(percent);
      onChange(percentToDate(percent), percentToDate(end));
    } else if (activeThumb === 'end' && percent > start) {
      setEnd(percent);
      onChange(percentToDate(start), percentToDate(percent));
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).replace(',', '');
  };

  return (
    <div className="w-full px-4 py-6">
      <div 
        className="relative h-2 bg-gray-200 rounded-lg"
        ref={sliderRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div 
          className="absolute h-2 bg-gray-400 hover:bg-blue-600 rounded-lg"
          style={{
            left: `${start}%`,
            width: `${end - start}%`
          }}
        />
        <div 
          className="absolute w-4 h-4 -mt-1 bg-brand-600 rounded-full cursor-pointer transform -translate-x-1/2"
          style={{ left: `${start}%` }}
          onMouseDown={() => handleMouseDown('start')}
          onMouseEnter={() => setShowStartPopover(true)}
          onMouseLeave={() => setShowStartPopover(false)}
        >
          {showStartPopover && (
            <div
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-sm"
            >
              <span className="text-gray-100">{formatDate(percentToDate(start))}</span>
              <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 transform -translate-x-1/2"></div>
            </div>
          )}
        </div>
        <div 
          className="absolute w-4 h-4 -mt-1 bg-brand-600 rounded-full cursor-pointer transform -translate-x-1/2"
          style={{ left: `${end}%` }}
          onMouseDown={() => handleMouseDown('end')}
          onMouseEnter={() => setShowEndPopover(true)}
          onMouseLeave={() => setShowEndPopover(false)}
        >
          {showEndPopover && (
            <div
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 whitespace-nowrap px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-sm"
            >
              <span className="text-gray-100">{formatDate(percentToDate(end))}</span>
              <div className="absolute w-2 h-2 bg-gray-900 rotate-45 -bottom-1 left-1/2 transform -translate-x-1/2"></div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mt-8 text-sm text-gray-600">
        <span>{formatDate(percentToDate(start))}</span>
        <span>{formatDate(percentToDate(end))}</span>
      </div>
    </div>
  );
}
