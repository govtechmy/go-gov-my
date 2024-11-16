import { ClientOnly } from '@dub/ui';
import LinkSelector from './link-selector';
import TagSelector from './tag-selector';
import CountrySelector from './country-selector';
import DeviceSelector from './device-selector';
import OSSelector from './os-selector';
import BrowserSelector from './browser-selector';
import CitySelector from './city-selector';
import ASNSelector from './asn-selector';

export default function FilterBar() {
  return (
    <ClientOnly>
      <div className="grid flex-wrap w-full grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 min-[550px]:w-auto lg:flex">
        <TagSelector />
        <LinkSelector />
        <CountrySelector />
        <DeviceSelector />
        <OSSelector />
        <BrowserSelector />
        <CitySelector />
        <ASNSelector />
      </div>
    </ClientOnly>
  );
}
