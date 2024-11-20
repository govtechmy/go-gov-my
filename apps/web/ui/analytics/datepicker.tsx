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
    //  set state based on url param
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
    if (startDate && endDate && endDate >= startDate) {
      startDate.setHours(0, 0, 0);
      const isToday = new Date().toDateString() === new Date(endDate).toDateString();
      // if the endDate is today, we set the time to current time, else set it to midnight
      if (isToday) {
        const now = new Date();
        endDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
      } else {
        endDate.setHours(23, 59, 59, 999);
      }
      const params = new URLSearchParams(window.location.search);
      params.set('start', startDate.toString());
      params.set('end', endDate.toString());
      router.replace(`?${params.toString()}`);
    }
  }, [startDate, endDate]);

  return (
    <div className="">
      {interval == 'custom' && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            maxDate={new Date()}
            className="w-full sm:w-auto font-inter rounded-md border border-gray-300 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <span className="xs:hidden sm:block mx-2 my-auto text-gray-600 font-inter">to</span>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            maxDate={new Date()}
            className="w-full sm:w-auto font-inter rounded-md border border-gray-300 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      )}
    </div>
  );
}
