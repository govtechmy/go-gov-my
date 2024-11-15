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
      <div className="bg-white w-full border-b border-gray-200">
        <MaxWidthWrapper className="flex flex-col bg-white py-4 sm:py-6 max-w-7xl">
          <div className="flex flex-row items-center justify-between xs:px-4 sm:px-4 md:px-2 lg:px-0">
            <PageTitle text={messages?.dashboard?.settings} />
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 z-10 font-poppins">
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
      </div>
      <MaxWidthWrapper className="max-w-7xl">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 p-4 sm:p-6">
          <div className="w-full md:w-64 md:flex-shrink-0">
            <div className="flex flex-col gap-1 bg-white rounded-lg p-4 font-poppins">
              {tabs.map(({ name, segment }) => (
                <NavLink key={name} segment={segment}>
                  {name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex-1 [&>*]:mb-3">{children}</div>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
