import { useIntlHook } from '@/lib/middleware/utils/useI18n';
import NavLink from '@/ui/layout/settings-nav-link';
import { MaxWidthWrapper } from '@dub/ui';
import { ReactNode } from 'react';
import NavTabs from '@/ui/layout/nav-tabs';
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
  const { messages } = useIntlHook(locale);

  return (
    <>
      <div className="flex flex-col border-b border-gray-200 bg-white py-6">
        <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
          <div className="flex items-center justify-between mx-6">
            <h1 className="truncate text-2xl text-gray-600 font-inter font-medium hidden xs:block mr-auto">
              {messages?.dashboard?.Links}
            </h1>
            <div className="flex gap-2">
              <div className="whitespace-nowrap"></div>
            </div>
          </div>
        </MaxWidthWrapper>
        <div className="w-full flex justify-center">
          <NavTabs />
        </div>
      </div>
      <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
        <div className="flex gap-8 p-6">
          {/* Left sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="flex flex-col gap-1">
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
