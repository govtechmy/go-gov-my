import { InputSelect, useRouterStuff } from '@dub/ui';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { ChromeIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';
import { DeviceTabs } from '@/lib/analytics/types';

export default function BrowserSelector() {
  const { queryParams } = useRouterStuff();

  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data } = useSWR<
    ({
      [key in DeviceTabs]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/browsers?${queryString}`, fetcher);

  const searchParams = useSearchParams();
  const selectedBrowser = useMemo(() => {
    if (data && data.length > 0) {
      const searchParamBrowser = searchParams.get('browser');
      return data.find(({ browser }) => browser === searchParamBrowser);
    }
  }, [searchParams, data]);

  return data ? (
    <InputSelect
      adjustForMobile
      items={data.map(({ browser }) => ({
        id: browser,
        value: browser,
      }))}
      icon={<ChromeIcon className="h-4 w-4 text-black" />}
      selectedItem={{
        id: selectedBrowser?.browser || '',
        value: selectedBrowser?.browser || '',
      }}
      setSelectedItem={(browser) => {
        if (browser && typeof browser !== 'function' && browser.value) {
          queryParams({
            set: { browser: browser.value },
          });
        } else {
          queryParams({ del: 'browser' });
        }
      }}
      inputAttrs={{
        placeholder: message?.filter_browsers,
      }}
      className="lg:w-48"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">{message?.no_browsers}</h4>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
