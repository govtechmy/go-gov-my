'use client';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { CustomSelect } from '@dub/ui';
import { usePathname, useRouter } from 'next/navigation';
import Globe from '../icons/globe';

export default function LocaleSwitcher() {
  // get current route
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useIntlClientHook();
  const pathWithoutLocale = '/' + pathname.split('/').splice(2).join('/');
  const options = [
    {
      label: 'BM',
      full: 'Bahasa Melayu',
      value: 'ms-MY',
    },
    {
      label: 'EN',
      full: 'English',
      value: 'en-GB',
    },
  ];

  const handleChangeSelect = (option: { label: string; value: string }) => {
    router.push(`/${option.value}${pathWithoutLocale}`);
  };

  return (
    <div>
      <CustomSelect
        icon={<Globe />}
        options={options}
        onChange={async (e) => handleChangeSelect(e)}
        defaultValue={options.findIndex((value) => value.value == locale)}
      />
    </div>
  );
}
