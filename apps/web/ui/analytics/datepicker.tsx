import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AnalyticsContext } from '.';

export default function Datepicker() {
  const router = useRouter();
  const { interval } = useContext(AnalyticsContext);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());

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

  return (
    <div className="">
      {interval == 'custom' && (
        <div className="flex-rows flex">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            maxDate={new Date()}
            className="mx-1 rounded-md border border-gray-300 px-2 py-1 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          -
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            maxDate={new Date()}
            className="mx-1 rounded-md border border-gray-300 px-2 py-1 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
