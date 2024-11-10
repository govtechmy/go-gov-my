import { useRouter } from 'next/navigation';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { AnalyticsContext } from '.';

export default function Datepicker() {
  const router = useRouter();
  const { interval } = useContext(AnalyticsContext);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (router) {
      const params = new URLSearchParams(window.location.search);
      const start = params.get('start');
      const end = params.get('end');

      const parsedStartDate = start ? new Date(start) : null;
      const parsedEndDate = end ? new Date(end) : null;

      if (parsedStartDate && !isNaN(parsedStartDate.getTime())) {
        setStartDate(parsedStartDate);
      }
      if (parsedEndDate && !isNaN(parsedEndDate.getTime())) {
        setEndDate(parsedEndDate);
      }
    }
  }, [router]);

  useEffect(() => {
    if (startDate && endDate && endDate > startDate) {
      const params = new URLSearchParams(window.location.search);
      params.set('start', startDate.toString());
      params.set('end', endDate.toString());
      router.replace(`?${params.toString()}`);
    }
  }, [startDate, endDate]);

  const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : null;
    setStartDate(dateValue);
  };

  const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : null;
    setEndDate(dateValue);
  };

  function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  return (
    <div className="">
      {interval == 'custom' && (
        <div>
          <input
            type="date"
            className="mx-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleStartDateChange}
            max={formatDateToYYYYMMDD(new Date())}
          />
          <input
            type="date"
            className="mx-1 rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleEndDateChange}
            max={formatDateToYYYYMMDD(new Date())}
          />
        </div>
      )}
    </div>
  );
}
