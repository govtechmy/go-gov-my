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
        <MaxWidthWrapper className={cn('flex flex-col border-b border-gray-200 bg-white py-6')}>
          <div className="flex flex-row items-center justify-between px-4 md:px-8 lg:px-16 xl:px-32">
            <PageTitle text={messages?.dashboard?.workspace_title} />
            <CreateWorkspaceButton />
          </div>
        </MaxWidthWrapper>
        <MaxWidthWrapper>
          <div className="my-4 grid grid-cols-1 gap-5 px-4 md:px-8 lg:px-16 xl:px-32">
            <WorkspaceList />
          </div>
        </MaxWidthWrapper>
      </WorkspaceListProvider>
    </MessagesProvider>
  );
}
