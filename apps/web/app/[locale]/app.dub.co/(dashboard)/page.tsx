import CreateWorkspaceButton from "@/ui/workspaces/create-workspace-button";
import WorkspaceList from "@/ui/workspaces/workspace-list";
import { MaxWidthWrapper } from "@dub/ui";
import { useIntlHook } from "@/lib/middleware/utils/useI18n";
import { MessagesProvider } from "@/ui/switcher/provider";

export default function App({ params: { locale } }) {
  const messages = useIntlHook(locale)
  return (
    <MessagesProvider messages={messages}>
      <div className="flex h-36 items-center border-b border-gray-200 bg-white">
        <MaxWidthWrapper>
          <div className="flex items-center justify-between">
            <h1 className="truncate text-2xl text-gray-600">{messages?.Dashboard?.workspace_title}</h1>
            <CreateWorkspaceButton />
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper>
        <div className="my-10 grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <WorkspaceList />
        </div>
      </MaxWidthWrapper>
    </MessagesProvider>
  );
}