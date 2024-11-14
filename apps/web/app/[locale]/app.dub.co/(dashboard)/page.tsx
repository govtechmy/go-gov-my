import { useIntlHook } from '@/lib/middleware/utils/useI18n';
import { MessagesProvider } from '@/ui/switcher/provider';
import CreateWorkspaceButton from '@/ui/workspaces/create-workspace-button';
import WorkspaceList from '@/ui/workspaces/workspace-list';
import { WorkspaceListProvider } from '@/ui/workspaces/workspace-list-context';
import WorkspaceListSearchInput from '@/ui/workspaces/workspace-list-search-input';
import WorkspaceSort from '@/ui/workspaces/workspace-sort';
import { MaxWidthWrapper } from '@dub/ui';
import { cn } from '@dub/utils';
import { Inter, Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export default function App({ params: { locale } }) {
  const { messages } = useIntlHook(locale);
  return (
    <MessagesProvider messages={messages}>
      <WorkspaceListProvider>
        <div className="flex flex-col border-b border-gray-200 bg-white py-6 xs:px-4">
          <MaxWidthWrapper>
            <div className="flex items-center justify-between">
              <h1 className="truncate text-2xl font-semibold hidden xs:block font-poppins">
                {messages?.dashboard?.workspace_title}
              </h1>
              <div className="flex items-center space-x-4">
                <CreateWorkspaceButton />
              </div>
            </div>
          </MaxWidthWrapper>
          <div className="mt-6 xs:px-4">
            <MaxWidthWrapper>
              <WorkspaceListSearchInput />
            </MaxWidthWrapper>
          </div>
        </div>
        <MaxWidthWrapper>
          <div className="my-4 grid grid-cols-1 gap-5 lg:grid-cols-1 xl:grid-cols-1 xs:px-4 sm:px-2 md:px-2 lg:px-2 xl:px-0">
            <WorkspaceList />
          </div>
        </MaxWidthWrapper>
      </WorkspaceListProvider>
    </MessagesProvider>
  );
}
