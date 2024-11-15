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
import { ReactNode } from 'react';
import Providers from './providers';
export const dynamic = 'force-static';
import Footer from '@/ui/shared/footer';

export const URL_GITHUB = 'https://github.com/govtechmy/go-gov-my';
export const URL_FIGMA =
  'https://www.figma.com/design/uwQdDuSxZ6FohazX1r7hxs/GoGovMy?node-id=0-1&t=qR9nMkJsfRphwT9g-1';
export const URL_APP_MAIN = 'https://pautan.org';
export const URL_APP_LOGIN = 'https://app.pautan.org/login';

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
        <div className="min-h-screen w-full bg-gray-50">
          <div className="sticky top-0 z-30 bg-white">
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
            </div>
          </div>
          <div className="xs:pb-2 lg:pb-5 xl:pb-10">{children}</div>
        </div>
        <MaxWidthWrapper>
          <Footer
            ministry={messages?.Footer?.kd}
            copyrightKey={messages?.Footer?.copyright}
            lastUpdateKey={messages?.Footer?.last_update}
            disclaimerKey={messages?.Footer?.disclaimer}
            privacyPolicyKey={messages?.Footer?.privacy_policy}
            descriptionWithNewlines={messages?.Footer?.address}
            followUsKey={messages?.Footer?.follow_us}
            links={[
              {
                title: messages?.Footer?.links?.title?.openSource,
                links: [
                  {
                    name: messages?.Footer?.links?.name?.figma,
                    href: URL_FIGMA,
                  },
                  {
                    name: messages?.Footer?.links?.name?.github,
                    href: URL_GITHUB,
                  },
                ],
              },
            ]}
          />
        </MaxWidthWrapper>
      </MessagesProvider>
    </Providers>
  );
}
