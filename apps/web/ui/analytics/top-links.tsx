import { TopLinksTabs } from '@/lib/analytics/types';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LoadingSpinner, Modal, TabSelect, useRouterStuff } from '@dub/ui';
import { fetcher, linkConstructor, truncate } from '@dub/utils';
import { Maximize, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import BarList from './bar-list';

export default function TopLinks() {
  const [tab, setTab] = useState<TopLinksTabs>('link');
  const { messages, locale } = useIntlClientHook();
  const message = messages?.analytics;

  const { basePath, baseApiPath, queryString, domain, key } = useContext(AnalyticsContext);

  useEffect(() => {
    if (domain && key) {
      setTab('url');
    } else {
      setTab('link');
    }
  }, [key]);

  const { data } = useSWR<
    ({ domain: string; key: string } & {
      [key in TopLinksTabs]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/top_${tab}s?${queryString}`, fetcher);

  const { queryParams } = useRouterStuff();
  const searchParams = useSearchParams();
  const root = searchParams.get('root');
  const [showModal, setShowModal] = useState(false);

  const barList = (limit?: number) => (
    <BarList
      tab={tab}
      data={
        data?.map((d) => ({
          icon: null,
          title: d[tab],
          href: queryParams({
            set: {
              [tab]: d[tab],
            },
            getNewPath: true,
          }) as string,
          clicks: d.clicks,
        })) || []
      }
      maxClicks={data?.[0]?.clicks || 0}
      barBackground="bg-blue-100"
      setShowModal={setShowModal}
      {...(limit && { limit })}
    />
  );

  return (
    <>
      <Modal showModal={showModal} setShowModal={setShowModal} className="max-w-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-lg font-semibold">{tab === 'link' ? 'Links' : 'URLs'}</h1>
        </div>
        {barList()}
      </Modal>
      <div className="scrollbar-hide relative z-0 h-[400px] border border-gray-200 bg-white px-7 py-5 sm:rounded-lg sm:border-gray-100 sm:shadow-lg">
        <div className="mb-3 flex justify-between">
          <h1 className="text-lg font-semibold capitalize">{tab === 'link' ? 'Links' : 'URLs'}</h1>
          {domain && key ? (
            !basePath.startsWith('/stats') && (
              <Link
                className="flex items-center space-x-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-500 transition-all hover:bg-gray-100"
                href={
                  queryParams({
                    del: ['domain', 'key'],
                    getNewPath: true,
                  }) as string
                }
              >
                <strong className="text-gray-800">
                  {truncate(linkConstructor({ domain, key, pretty: true }), 24)}
                </strong>
                <X className="h-4 w-4" />
              </Link>
            )
          ) : (
            <TabSelect
              options={['Links']}
              selected="Links"
              selectAction={(option) =>
                queryParams({
                  ...((root === 'false' && option === 'Links') ||
                  (root === 'true' && option === 'Domains')
                    ? { del: ['root'] }
                    : {
                        set: {
                          root: option === 'Links' ? 'false' : 'true',
                        },
                      }),
                  replace: true,
                })
              }
              translation={message}
            />
          )}
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
            className="absolute inset-x-0 bottom-4 z-10 mx-auto flex w-full items-center justify-center rounded-md bg-gradient-to-b from-transparent to-white text-gray-500 transition-all hover:text-gray-800 active:scale-95"
          >
            <div className="flex items-center space-x-1 bg-white px-4 py-2">
              <Maximize className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase">{message?.view_all}</p>
            </div>
          </button>
        )}
      </div>
    </>
  );
}
