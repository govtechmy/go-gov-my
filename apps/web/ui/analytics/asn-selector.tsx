import { InputSelect, useRouterStuff } from '@dub/ui';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Network } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';
import { DeviceTabs } from '@/lib/analytics/types';

export default function ASNSelector() {
  const { queryParams } = useRouterStuff();

  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data } = useSWR<
    ({
      [key in DeviceTabs]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/asn?${queryString}`, fetcher);

  const searchParams = useSearchParams();
  const selectedASN = useMemo(() => {
    if (data && data.length > 0) {
      const searchParamASN = searchParams.get('asn');
      return data.find(({ asn }) => asn === searchParamASN);
    }
  }, [searchParams, data]);

  return data ? (
    <InputSelect
      adjustForMobile
      items={data.map(({ asn, organization }) => ({
        id: asn,
        value: asn,
        organization: organization,
      }))}
      icon={<Network className="h-4 w-4 text-black" />}
      selectedItem={{
        id: selectedASN?.asn || '',
        value: selectedASN?.asn || '',
      }}
      setSelectedItem={(asn) => {
        if (asn && typeof asn !== 'function' && asn.value) {
          queryParams({
            set: { asn: asn.value },
          });
        } else {
          queryParams({ del: 'asn' });
        }
      }}
      inputAttrs={{
        placeholder: message?.filter_ASN,
      }}
      className="lg:w-48"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">{message?.no_asn}</h4>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
