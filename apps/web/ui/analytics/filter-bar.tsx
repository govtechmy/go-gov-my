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
      <div className="grid w-full grid-cols-4 lg:grid-cols-8 gap-2">
        <div className="contents [&>*]:min-w-0">
          <TagSelector />
          <LinkSelector />
          <CountrySelector />
          <DeviceSelector />
          <OSSelector />
          <BrowserSelector />
          <CitySelector />
          <ASNSelector />
        </div>
      </div>
    </ClientOnly>
  );
}
