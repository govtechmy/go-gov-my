import { DeviceTabs } from '@/lib/analytics/types';
import { formatAnalyticsEndpoint } from '@/lib/analytics/utils';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LoadingSpinner, Modal, TabSelect, useRouterStuff } from '@dub/ui';
import { fetcher } from '@dub/utils';
import { Maximize } from 'lucide-react';
import { useContext, useMemo, useState } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import BarList from './bar-list';
import DeviceIcon from './device-icon';

export default function Devices() {
  const [tab, setTab] = useState<DeviceTabs>('devices');
  const singularTabName = useMemo(() => formatAnalyticsEndpoint(tab, 'singular'), [tab]);
  const { messages, locale } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data } = useSWR<
    ({
      [key in DeviceTabs]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/${tab}?${queryString}`, fetcher);

  const { queryParams } = useRouterStuff();
  const [showModal, setShowModal] = useState(false);

  const barList = (limit?: number) => (
    <BarList
      tab={singularTabName}
      data={
        data?.map((d) => ({
          icon: <DeviceIcon display={d[singularTabName]} tab={tab} className="h-4 w-4" />,
          title:
            singularTabName === 'device'
              ? capitalizeFirstLetter(d[singularTabName])
              : d[singularTabName],
          href: queryParams({
            set: {
              [singularTabName]: d[singularTabName],
            },
            getNewPath: true,
          }) as string,
          clicks: d.clicks,
        })) || []
      }
      maxClicks={data?.[0]?.clicks || 0}
      barBackground="bg-green-100"
      setShowModal={setShowModal}
      {...(limit && { limit })}
    />
  );

  return (
    <>
      <Modal showModal={showModal} setShowModal={setShowModal} className="max-w-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-semibold">{message?.devices}</h1>
        </div>
        {barList()}
      </Modal>
      <div className="scrollbar-hide relative z-0 h-[400px] border border-gray-200 bg-white px-7 py-5 sm:rounded-lg sm:border-gray-100 sm:shadow-lg">
        <div className="mb-3 flex justify-between">
          <h1 className="text-lg font-semibold">{message?.devices}</h1>
          <TabSelect
            options={['devices', 'browsers', 'os']}
            translation={message}
            selected={tab}
            // @ts-ignore
            selectAction={setTab}
          />
        </div>
        {data ? (
          data.length > 0 ? (
            barList(9)
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-sm text-gray-600">{message?.no_data}</p>
            </div>
          )
        ) : (
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {data && data.length > 9 && (
          <button
            onClick={() => setShowModal(true)}
            className="absolute inset-x-0 bottom-4 z-10 mx-auto flex w-full items-center justify-center space-x-2 rounded-md bg-gradient-to-b from-transparent to-white py-2 text-gray-500 transition-all hover:text-gray-800 active:scale-95"
          >
            <Maximize className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase">{message?.view_all}</p>
          </button>
        )}
      </div>
    </>
  );
}

function capitalizeFirstLetter(str: string) {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
