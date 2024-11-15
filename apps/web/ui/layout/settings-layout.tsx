'use client';

import NavLink from '@/ui/layout/settings-nav-link';
import { Button, MaxWidthWrapper } from '@dub/ui';
import { ReactNode } from 'react';
import NavTabs from '@/ui/layout/nav-tabs';
import PageTitle from '../typography/page-title';
import { cn } from '@dub/utils';
import { LinkButton } from '@dub/ui/src/link-button';
import { LineChart, Download, Settings, Link, List } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { useCallback, useEffect } from 'react';

export default function SettingsLayout({
  tabs,
  children,
  locale,
}: {
  tabs: {
    name: string;
    segment: string | null;
  }[];
  children: ReactNode;
  locale: string;
}) {
  const { messages } = useIntlClientHook(locale);
  const params = useParams() as { slug: string };
  const { slug } = params;
  const router = useRouter();

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const existingModalBackdrop = document.getElementById('modal-backdrop');

      if (
        !e.metaKey &&
        !e.ctrlKey &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !existingModalBackdrop
      ) {
        const key = e.key.toLowerCase();

        switch (key) {
          case 'w':
            e.preventDefault();
            router.push(`/${locale}`);
            break;
          case 'a':
            e.preventDefault();
            router.push(`/${locale}/${slug}/analytics`);
            break;
        }
      }
    },
    [locale, slug, router]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <>
      <MaxWidthWrapper className={cn('flex flex-col border-b border-gray-200 bg-white py-6')}>
        <div className="flex flex-row items-center justify-between px-4 md:px-8 lg:px-16 xl:px-32">
          <PageTitle text={messages?.dashboard?.settings} />
          <div className="flex items-center gap-3 ">
            <div
              className="flex items-center space-x-2 z-10 font-poppins"
              onClick={(e) => e.preventDefault()}
            >
              <LinkButton
                icon={<List className="h-4 w-4" />}
                variant="success"
                shortcut="W"
                href={`/${locale}`}
                text={messages?.dashboard?.workspaces}
                className="hidden sm:flex"
              />
              <LinkButton
                icon={<List className="h-4 w-4" />}
                variant="success"
                href={`/${locale}/${slug}`}
                className="sm:hidden flex"
              />
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
      <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl font-poppins">
        <div className="flex gap-8 p-6 ">
          {/* Left sidebar */}
          <div className="w-64 flex-shrink-0 ">
            <div className="flex flex-col gap-1 bg-white rounded-lg p-4 font-poppins">
              {tabs.map(({ name, segment }) => (
                <NavLink key={name} segment={segment}>
                  {name}
                </NavLink>
              ))}
            </div>
          </div>
          {/* Main content */}
          <div className="flex-1 [&>*]:mb-3">{children}</div>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
