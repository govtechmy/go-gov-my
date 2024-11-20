import { InputSelect, useRouterStuff } from '@dub/ui';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { AppWindow } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';
import { AnalyticsType } from '@/lib/analytics/types';

export default function OSSelector() {
  const { queryParams } = useRouterStuff();

  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data } = useSWR<
    ({
      [key in AnalyticsType]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/os?${queryString}`, fetcher);

  const searchParams = useSearchParams();
  const selectedOS = useMemo(() => {
    if (data && data.length > 0) {
      const searchParamOS = searchParams.get('os');
      return data.find(({ os }) => os === searchParamOS);
    }
  }, [searchParams, data]);

  return data ? (
    <InputSelect
      adjustForMobile
      items={data.map(({ os }) => ({
        id: os,
        value: os,
      }))}
      icon={<AppWindow className="h-4 w-4 text-black" />}
      selectedItem={{
        id: selectedOS?.os || '',
        value: selectedOS?.os || '',
      }}
      setSelectedItem={(os) => {
        if (os && typeof os !== 'function' && os.value) {
          queryParams({
            set: { os: os.value },
          });
        } else {
          queryParams({ del: 'os' });
        }
      }}
      inputAttrs={{
        placeholder: message?.filter_OS,
      }}
      className="w-full"
      containerClassName="w-full"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">{message?.no_os}</h4>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
