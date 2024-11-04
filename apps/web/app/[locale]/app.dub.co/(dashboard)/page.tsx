import { useIntlHook } from '@/lib/middleware/utils/useI18n';
import { MessagesProvider } from '@/ui/switcher/provider';
import CreateWorkspaceButton from '@/ui/workspaces/create-workspace-button';
import WorkspaceList from '@/ui/workspaces/workspace-list';
import { WorkspaceListProvider } from '@/ui/workspaces/workspace-list-context';
import WorkspaceListSearchInput from '@/ui/workspaces/workspace-list-search-input';
import { MaxWidthWrapper } from '@dub/ui';

export default function App({ params: { locale } }) {
  const { messages } = useIntlHook(locale);
  return (
    <MessagesProvider messages={messages}>
      <WorkspaceListProvider>
        <div className="flex h-36 items-center border-b border-gray-200 bg-white">
          <MaxWidthWrapper>
            <div className="flex items-center justify-between">
              <h1 className="truncate text-2xl text-gray-600">
                {messages?.dashboard?.workspace_title}
              </h1>
              <CreateWorkspaceButton />
            </div>
            <div className="mt-2 max-w-md">
              <WorkspaceListSearchInput />
            </div>
          </MaxWidthWrapper>
        </div>
        <MaxWidthWrapper>
          <div className="my-10 grid grid-cols-1 gap-5 pb-20 lg:grid-cols-2 xl:grid-cols-3">
            <WorkspaceList />
          </div>
        </MaxWidthWrapper>
      </WorkspaceListProvider>
    </MessagesProvider>
  );
}
