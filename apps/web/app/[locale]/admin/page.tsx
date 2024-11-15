import { useIntlHook } from '@/lib/middleware/utils/useI18n';
import { cn, constructMetadata } from '@dub/utils';
import LinkManagement from './components/link-management';
import MemberLists from './components/member-lists';
import ClicksAdmin from '@/ui/analytics/clicks-admin';
import { MessagesProvider } from '@/ui/switcher/provider';
import { WorkspaceListProvider } from '@/ui/workspaces/workspace-list-context';
import { MaxWidthWrapper } from '@dub/ui';
import PageTitle from '@/ui/typography/page-title';
import CreateWorkspaceButton from '@/ui/workspaces/create-workspace-button';
import WorkspaceList from '@/ui/workspaces/workspace-list';

export async function generateMetadata({ params }) {
  const { locale } = params;
  return constructMetadata({
    locale,
    title: `${process.env.NEXT_PUBLIC_APP_NAME} - Admin Portal`,
    noIndex: true,
  });
}

export default function AdminPage({ params: { locale } }: { params: { locale: string } }) {
  const { messages } = useIntlHook(locale);
  return (
    <>
      <MessagesProvider messages={messages}>
        <WorkspaceListProvider>
          <div className="bg-white w-full border-b border-gray-200">
            <MaxWidthWrapper className={cn('flex flex-col  bg-white py-6 max-w-7xl')}>
              <div className="flex flex-row items-center justify-between xs:px-4 sm:px-4 md:px-2 lg:px-0">
                <PageTitle text={messages?.layout?.admin} />
              </div>
            </MaxWidthWrapper>
          </div>
          <MaxWidthWrapper className="max-w-7xl">
            <ClicksAdmin />
            <MemberLists />
            <LinkManagement />
          </MaxWidthWrapper>
        </WorkspaceListProvider>
      </MessagesProvider>
    </>
  );
}
