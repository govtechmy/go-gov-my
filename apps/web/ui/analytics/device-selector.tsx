import { InputSelect, useRouterStuff } from '@dub/ui';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { MonitorSmartphone, MonitorSmartphoneIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';
import { DeviceTabs } from '@/lib/analytics/types';
import DeviceIcon from './device-icon';

export default function DeviceSelector() {
  const { queryParams } = useRouterStuff();

  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data } = useSWR<
    ({
      [key in DeviceTabs]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/devices?${queryString}`, fetcher);

  const searchParams = useSearchParams();
  const selectedDevice = useMemo(() => {
    if (data && data.length > 0) {
      const searchParamDevice = searchParams.get('device');
      return data.find(({ device }) => device === searchParamDevice);
    }
  }, [searchParams, data]);

  return data ? (
    <InputSelect
      adjustForMobile
      items={data.map(({ device }) => ({
        id: device,
        value: device,
      }))}
      icon={<MonitorSmartphoneIcon className="h-4 w-4 text-black" />}
      selectedItem={{
        id: selectedDevice?.device || '',
        value: selectedDevice?.device || '',
      }}
      setSelectedItem={(device) => {
        if (device && typeof device !== 'function' && device.value) {
          queryParams({
            set: { device: device.value },
          });
        } else {
          queryParams({ del: 'device' });
        }
      }}
      inputAttrs={{
        placeholder: message?.filter_devices,
      }}
      className="lg:w-48"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">{message?.no_devices}</h4>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
