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
          <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
            <div className="flex items-center justify-between mx-6">
              <h1 className="truncate text-2xl text-gray-600">
                {messages?.dashboard?.workspace_title}
              </h1>
              <CreateWorkspaceButton />
            </div>
            <div className="mt-2 max-w-md mx-6">
              <WorkspaceListSearchInput />
            </div>
          </MaxWidthWrapper>
        </div>
        <MaxWidthWrapper className="px-0 md:px-0 lg:px-0 max-w-7xl">
          <div className="my-10 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3 mx-6">
            <WorkspaceList />
          </div>
        </MaxWidthWrapper>
      </WorkspaceListProvider>
    </MessagesProvider>
  );
}
