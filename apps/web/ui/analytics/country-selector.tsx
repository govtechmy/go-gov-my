import { InputSelect, useRouterStuff } from '@dub/ui';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Globe } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';

export default function CountrySelector() {
  const { queryParams } = useRouterStuff();
  const { workspaceId } = useContext(AnalyticsContext);

  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data: countries } = useSWR<
    {
      country: string;
    }[]
  >(`${baseApiPath}/countries?${queryString}`, fetcher);

  const searchParams = useSearchParams();
  const selectedCountry = useMemo(() => {
    if (countries && countries.length > 0) {
      const searchParamCountry = searchParams.get('country');
      return countries.find(({ country }) => country === searchParamCountry);
    }
  }, [searchParams, countries]);

  return countries ? (
    <InputSelect
      adjustForMobile
      items={countries.map(({ country }) => ({
        id: country,
        value: country,
      }))}
      icon={<Globe className="h-4 w-4 text-black" />}
      selectedItem={{
        id: selectedCountry?.country || '',
        value: selectedCountry?.country || '',
      }}
      setSelectedItem={(country) => {
        if (country && typeof country !== 'function' && country.value) {
          queryParams({
            set: { country: country.value },
          });
        } else {
          queryParams({ del: 'country' });
        }
      }}
      inputAttrs={{
        placeholder: message?.filter_countries,
      }}
      className="lg:w-48"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">{message?.no_countries}</h4>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
