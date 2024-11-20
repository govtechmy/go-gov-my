import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { BlurImage, ExpandingArrow, useScroll } from '@dub/ui';
import {
  APP_NAME,
  DUB_LOGO,
  GOOGLE_FAVICON_URL,
  cn,
  getApexDomain,
  linkConstructor,
} from '@dub/utils';
import { useContext } from 'react';
import { AnalyticsContext } from '.';
import DateRangePicker from './date-range-picker';
import Datepicker from './datepicker';
import ExportButton from './export-button';
import FilterBar from './filter-bar';
import SharePopover from './share-popover';

export default function Toggle({ actions }: { actions?: React.ReactNode }) {
  const { basePath, domain, key, url, admin } = useContext(AnalyticsContext);
  const { messages } = useIntlClientHook();

  const scrolled = useScroll(80);

  const isPublicStatsPage = basePath.startsWith('/stats');

  return (
    <div
      className={cn('top-[6.85rem] z-10 mb-5 bg-gray-50 py-3 md:py-3', {
        'top-14': isPublicStatsPage,
        'top-0': admin,
        'shadow-md': scrolled,
      })}
    >
      <div
        className={cn(
          'mx-auto flex w-full max-w-7xl flex-col gap-2 space-y-3 px-2.5 md:space-y-0 lg:px-2',
          {
            'md:h-10': key,
          }
        )}
      >
        <div
          className={cn('flex w-full flex-col items-center justify-between gap-2 md:flex-row', {
            'flex-col md:flex-row': !key,
            'items-center': key,
          })}
        >
          {isPublicStatsPage && key ? (
            <a
              className="group flex items-center text-lg font-semibold text-gray-800"
              href={linkConstructor({ domain, key })}
              target="_blank"
              rel="noreferrer"
            >
              <BlurImage
                alt={url || APP_NAME}
                src={url ? `${GOOGLE_FAVICON_URL}${getApexDomain(url)}` : DUB_LOGO}
                className="mr-2 h-6 w-6 flex-shrink-0 overflow-hidden rounded-full"
                width={48}
                height={48}
              />
              <p className="max-w-[192px] truncate sm:max-w-[400px]">
                {linkConstructor({
                  domain,
                  key,
                  pretty: true,
                })}
              </p>
              <ExpandingArrow className="h-5 w-5" />
            </a>
          ) : (
            <div className="truncate text-2xl text-gray-600"></div>
            // <h2 className="truncate text-2xl text-gray-600">{messages?.dashboard?.analytics}</h2>
          )}
          <div
            className={cn('flex flex-wrap items-center gap-2', {
              'w-full flex-col min-[550px]:flex-row md:w-auto': !key,
              'w-full md:w-auto': key,
            })}
          >
            <div className="mx-auto w-full max-w-7xl px-2.5 lg:px-2">
              <div className="flex flex-col gap-4">
                {/* Date Range Controls - Responsive */}
                <div className="flex flex-wrap justify-end items-center gap-2">
                  <div className="w-full sm:w-auto">
                    <DateRangePicker />
                  </div>
                  <div className="w-full sm:w-auto">
                    <Datepicker />
                  </div>
                </div>

                {/* Filter Bar */}
                <FilterBar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
