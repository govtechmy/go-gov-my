import { InputSelect, useRouterStuff } from '@dub/ui';
import { DUB_LOGO, GOOGLE_FAVICON_URL, getApexDomain } from '@dub/utils';
import { Building2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo } from 'react';
import { ModalContext } from '../modals/provider';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';
import { DeviceTabs } from '@/lib/analytics/types';

export default function CitySelector() {
  const { queryParams } = useRouterStuff();

  const { baseApiPath, queryString } = useContext(AnalyticsContext);

  const { data: cities } = useSWR<
    ({
      [key in DeviceTabs]: string;
    } & { clicks: number })[]
  >(`${baseApiPath}/cities?${queryString}`, fetcher);

  const searchParams = useSearchParams();
  const selectedCity = useMemo(() => {
    if (cities && cities.length > 0) {
      const searchParamCity = searchParams.get('city');
      return cities.find(({ city }) => city === searchParamCity);
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
        id: selectedCity?.value || '',
        value: selectedCity?.value || '',
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
        placeholder: 'Filter cities',
      }}
      className="lg:w-48"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">
            No cities found in this workspace
          </h4>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
