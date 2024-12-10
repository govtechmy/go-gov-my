'use client';

import { Button } from '@/components/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select';
import { locales } from '@/i18n-config';
import ChevronDown from '@/icons/chevron-down';
import Globe from '@/icons/globe';
import { usePathname, useRouter } from '@/lib/i18n';
import { SelectIcon } from '@radix-ui/react-select';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

export default function Locale() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = searchParams.get('locale') || 'en-GB';
  const [isPending, startTransition] = useTransition();
  const onValueChange = (newLocale: string) => {
    const current = new URLSearchParams(searchParams);
    current.set('locale', newLocale);
    const search = current.toString();
    startTransition(() => {
      router.replace(`${pathname}?${search}`, { scroll: false });
    });
  };

  const name: Record<string, { full: string; short: string }> = {
    'en-GB': {
      full: 'English',
      short: 'EN',
    },
    'ms-MY': {
      full: 'Bahasa Melayu',
      short: 'BM',
    },
  };

  return (
    <Select value={locale} onValueChange={onValueChange}>
      <SelectTrigger asChild>
        <Button variant="secondary">
          <Globe />
          <SelectValue>{name[locale]?.short || locale}</SelectValue>
          <SelectIcon>
            <ChevronDown />
          </SelectIcon>
        </Button>
      </SelectTrigger>
      <SelectContent className="w-full" align="end">
        {locales.map((l) => (
          <SelectItem key={l} value={l} className={l === locale ? 'font-medium' : ''}>
            {name[l]?.full || l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
