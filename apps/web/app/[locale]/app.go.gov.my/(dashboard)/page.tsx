import { useIntlHook } from '@/lib/middleware/utils/useI18n';
import { MessagesProvider } from '@/ui/switcher/provider';
import PageTitle from '@/ui/typography/page-title';
import CreateWorkspaceButton from '@/ui/workspaces/create-workspace-button';
import WorkspaceList from '@/ui/workspaces/workspace-list';
import { WorkspaceListProvider } from '@/ui/workspaces/workspace-list-context';
import { MaxWidthWrapper } from '@dub/ui';
import { cn } from '@dub/utils';

export default function App({ params: { locale } }) {
  const { messages } = useIntlHook(locale);
  return (
    <MessagesProvider messages={messages}>
      <WorkspaceListProvider>
        <div className="bg-white w-full border-b border-gray-200">
          <MaxWidthWrapper className={cn('flex flex-col  bg-white py-6 max-w-7xl')}>
            <div className="flex flex-row items-center justify-between xs:px-4 sm:px-4 md:px-2 lg:px-0">
              <PageTitle text={messages?.dashboard?.workspace_title} />
              <CreateWorkspaceButton />
            </div>
          </MaxWidthWrapper>
        </div>
        <MaxWidthWrapper className="max-w-7xl">
          <div className="my-4 grid grid-cols-1 gap-5 xs:px-4 sm:px-4 md:px-2 lg:px-0">
            <WorkspaceList />
          </div>
        </MaxWidthWrapper>
      </WorkspaceListProvider>
    </MessagesProvider>
  );
}
