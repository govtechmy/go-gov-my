import { INTERVAL_DISPLAYS } from '@/lib/analytics/constants';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useWorkspace from '@/lib/swr/use-workspace';
import { IconMenu, Popover, Tick, Tooltip, TooltipContent, useRouterStuff } from '@dub/ui';
import { APP_DOMAIN, cn, getNextPlan } from '@dub/utils';
import { Calendar, ChevronDown, Lock } from 'lucide-react';
import Link from 'next/link';
import { useContext, useMemo, useState } from 'react';
import { AnalyticsContext } from '.';

export default function DateRangePicker() {
  const { queryParams } = useRouterStuff();
  const { messages, locale } = useIntlClientHook();
  const wrapper = messages?.INTERVAL_DISPLAYS;

  const { basePath, interval, admin } = useContext(AnalyticsContext);

  const [openDatePopover, setOpenDatePopover] = useState(false);

  const selectedInterval = useMemo(() => {
    return INTERVAL_DISPLAYS.find((s) => s.value === interval) || INTERVAL_DISPLAYS[1];
  }, [interval]);

  const { plan } = useWorkspace();

  const isPublicStatsPage = basePath.startsWith('/stats');

  return (
    <Popover
      content={
        <div className="grid w-full p-2 md:w-48">
          {INTERVAL_DISPLAYS.map(({ display, value }) => (
            <Link
              key={value}
              href={
                queryParams({
                  set: {
                    interval: value,
                    start: '',
                    end: '',
                  },
                  getNewPath: true,
                }) as string
              }
              className="flex w-full items-center justify-between space-x-2 rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
            >
              <p className="text-sm">{wrapper[display]}</p>
              {selectedInterval.value === value && <Tick className="h-4 w-4" aria-hidden="true" />}
            </Link>
          ))}
        </div>
      }
      openPopover={openDatePopover}
      setOpenPopover={setOpenDatePopover}
    >
      <button
        onClick={() => setOpenDatePopover(!openDatePopover)}
        className={cn(
          'flex items-center justify-between space-x-2 truncate rounded-md border border-gray-200 bg-white px-3 py-2.5 transition-all',
          {
            'truncate border-gray-500 ring-4 ring-gray-200': openDatePopover,
          }
        )}
      >
        <IconMenu
          text={wrapper[selectedInterval.display]}
          icon={<Calendar className="h-4 w-4 flex-shrink-0" />}
        />
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-gray-400 ${
            openDatePopover ? 'rotate-180 transform' : ''
          } transition-all duration-75`}
        />
      </button>
    </Popover>
  );
}
