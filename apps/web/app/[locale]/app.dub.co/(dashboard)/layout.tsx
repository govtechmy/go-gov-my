import { useIntlHook } from '@/lib/middleware/utils/useI18n';
import Header from '@/ui/header/header';
import AgencyLabel from '@/ui/layout/agency-label';
import NavTabs from '@/ui/layout/nav-tabs';
import UserDropdown from '@/ui/layout/user-dropdown';
import WorkspaceSwitcher from '@/ui/layout/workspace-switcher';
import { Divider } from '@/ui/shared/icons';
import { MessagesProvider } from '@/ui/switcher/provider';
import LocaleSwitcher from '@/ui/switcher/switcher';
import { MaxWidthWrapper, NavLogo } from '@dub/ui';
import { cn, constructMetadata } from '@dub/utils';
import Link from 'next/link';
import { ReactNode, Suspense } from 'react';
import Providers from './providers';
export const dynamic = 'force-static';
import { poppins, inter } from '@/styles/fonts'; // Add this import
export async function generateMetadata({ params }) {
  const { locale } = params;
  return constructMetadata({ locale });
}

export default function Layout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: string };
}) {
  const { messages } = useIntlHook(locale);
  return (
    <Providers>
      <MessagesProvider messages={messages}>
        <div className="min-h-screen w-full bg-gray-50 pb-20">
          <div className="relative">
            <Header />
            <div className="w-full bg-white shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
              <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
                <div className="flex h-16 items-center justify-between xs:mx-4 sm:mx-4 md:mx-2 lg:mx-0">
                  <div className="flex items-center">
                    <Link href={`/${locale}`} className="hidden sm:block">
                      <NavLogo variant="symbol" isInApp className="w-10" />
                    </Link>
                    <Divider className="hidden h-8 w-8 text-gray-200 sm:ml-3 sm:block" />
                    <WorkspaceSwitcher />
                    <AgencyLabel />
                  </div>
                  <div className="flex items-center space-x-6">
                    <LocaleSwitcher />
                    <UserDropdown />
                  </div>
                </div>
              </MaxWidthWrapper>
              <div className="border-t border-gray-200 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
                <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
                  <Suspense fallback={<div className="h-12 w-full" />}>
                    <NavTabs />
                  </Suspense>
                </MaxWidthWrapper>
              </div>
            </div>
            {children}
          </div>
        </div>
      </MessagesProvider>
    </Providers>
  );
}
