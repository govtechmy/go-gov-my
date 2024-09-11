import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import { ExpandingArrow } from "@dub/ui";
import { Command, useCommandState } from "cmdk";
import Fuse from "fuse.js";
import { MessageSquareText } from "lucide-react";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useContext, useMemo, useRef } from "react";
import Highlighter from "react-highlight-words";
import { HelpContext } from "./portal";

export function HelpArticles({
  setScreen,
}: {
  setScreen: Dispatch<SetStateAction<"main" | "contact">>;
}) {
  const { data: session } = useSession();
  const commandListRef = useRef<HTMLDivElement>(null);
  const { messages } = useIntlClientHook();
  const message = messages?.help;

  return (
    <div>
      <div className="p-2 sm:p-4">
        <div className="p-2">
          <h3 className="text-lg font-semibold text-gray-700">
            👋 {message?.how}
          </h3>
        </div>
        <Command label="help-portal" loop shouldFilter={false}>
          <Command.Input
            autoFocus
            onInput={(e) => {
              // hack to scroll to top of list when input changes (for some reason beyond my comprehension, setTimeout is needed)
              setTimeout(() => {
                commandListRef.current?.scrollTo(0, 0);
              }, 0);
            }}
            placeholder={message?.help_placeholder}
            className="w-full border-none p-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-0"
          />
          <Command.List
            ref={commandListRef}
            className="scrollbar-hide h-[22rem] overflow-scroll border-t border-gray-200 py-2 transition-all"
          >
            <Command.Empty
              onClick={() => setScreen("contact")}
              className="flex cursor-pointer items-center space-x-2 rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-600"
            >
              <MessageSquareText className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-purple-600">
                  {message?.cant_find}
                </p>
                <p className="text-xs text-gray-400">{message?.send_message}</p>
              </div>
            </Command.Empty>
            <CommandResults />
          </Command.List>
        </Command>
      </div>
      <div className="flex justify-between border-t border-gray-200 px-3 py-4 sm:px-6">
        {session ? (
          <button
            onClick={() => setScreen("contact")}
            className="flex items-center space-x-2 hover:underline"
          >
            <MessageSquareText className="h-4 w-4" />
            <p className="text-sm">{message?.contact_us}</p>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

const CommandResults = () => {
  const {
    popularHelpArticles: POPULAR_HELP_CONTENT,
    allHelpArticles: ALL_HELP_CONTENT,
  } = useContext(HelpContext);

  const fuse = useMemo(
    () =>
      new Fuse(ALL_HELP_CONTENT, {
        keys: ["title", "searchableSummary"],
      }),
    [ALL_HELP_CONTENT],
  );

  const search = useCommandState((state) => state.search);

  const results = useMemo(() => {
    if (search.length === 0) {
      return POPULAR_HELP_CONTENT;
    }
    return fuse.search(search).map((r) => r.item);
  }, [search, POPULAR_HELP_CONTENT]);

  return results.map(({ slug, title, summary }) => (
    <Command.Item
      key={slug}
      value={title}
      onSelect={() => {
        window.open(`https://github.com/govtechmy/go-gov-my/discussions`);
      }}
      className="group flex cursor-pointer items-center justify-between space-x-2 rounded-md px-4 py-2 hover:bg-gray-100 active:bg-gray-200 aria-selected:bg-gray-100"
    >
      <div className="flex flex-col space-y-1">
        <Highlighter
          highlightClassName="underline bg-transparent text-purple-500"
          searchWords={search.split(" ")}
          autoEscape={true}
          textToHighlight={title}
          className="text-sm font-medium text-gray-600 group-aria-selected:text-purple-600 sm:group-hover:text-purple-600"
        />
        <Highlighter
          highlightClassName="underline bg-transparent text-purple-500"
          searchWords={search.split(" ")}
          autoEscape={true}
          textToHighlight={summary}
          className="line-clamp-1 text-xs text-gray-400"
        />
      </div>
      <ExpandingArrow className="invisible -ml-4 h-4 w-4 text-purple-600 group-aria-selected:visible sm:group-hover:visible" />
    </Command.Item>
  ));
};
