import { InputSelect, useRouterStuff } from '@dub/ui';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Building2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo } from 'react';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';
import { LocationTabs } from '@/lib/analytics/types';

export default function CitySelector() {
  const { queryParams } = useRouterStuff();
  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data: cities } = useSWR<
    ({
      [key in LocationTabs]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/cities?${queryString}`, fetcher);

  const searchParams = useSearchParams();
  const selectedCity = useMemo(() => {
    if (cities && cities.length > 0) {
      const searchParamCity = searchParams.get('city');
      return cities.find(({ city, country }) => {
        return `${country}:${city}` === searchParamCity;
      });
    }
  }, [searchParams, cities]);

  return cities ? (
    <InputSelect
      adjustForMobile
      items={cities.map(({ city, country }) => ({
        id: `${country}:${city}`,
        value: `${country}:${city}`,
        country: country,
        city: city,
      }))}
      icon={<Building2 className="h-4 w-4 text-black" />}
      selectedItem={{
        id: selectedCity ? `${selectedCity.country}:${selectedCity.city}` : '',
        value: selectedCity ? `${selectedCity.country}:${selectedCity.city}` : '',
      }}
      setSelectedItem={(city) => {
        if (city && typeof city !== 'function' && city.value) {
          queryParams({
            set: { city: city.value },
          });
        } else {
          queryParams({ del: 'city' });
        }
      }}
      inputAttrs={{
        placeholder: message?.filter_cities,
      }}
      className="w-full"
      containerClassName="w-full"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">{message?.no_cities}</h4>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
