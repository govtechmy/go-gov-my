'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useWorkspace from '@/lib/swr/use-workspace';
import { CopyButton } from '@dub/ui';

export default function WorkspaceId() {
  const { id } = useWorkspace();
  const { messages } = useIntlClientHook();

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="relative flex flex-col space-y-6 p-5 sm:p-10">
          <div className="flex flex-col space-y-3">
            <h2 className="text-xl font-medium">
              {messages?.workspace?.workspace_id}
            </h2>
            <p className="text-sm text-gray-500">
              {`You'll need this ID to interact with the ${process.env.NEXT_PUBLIC_APP_NAME} API.`}
            </p>
          </div>
          {id ? (
            <div className="flex w-full max-w-md items-center justify-between rounded-md border border-gray-300 bg-white p-2">
              <p className="text-sm text-gray-500">{id}</p>
              <CopyButton value={id} className="rounded-md" />
            </div>
          ) : (
            <div className="h-[2.35rem] w-full max-w-md animate-pulse rounded-md bg-gray-200" />
          )}
        </div>
        <div className="flex items-center justify-between rounded-b-lg border-t border-gray-200 bg-gray-50 px-3 py-5 sm:px-10">
          <a
            href="https://github.com/govtechmy/go-gov-my/discussions"
            target="_blank"
            className="text-sm text-gray-400 underline underline-offset-4 transition-colors hover:text-gray-700"
          >
            {messages?.workspace?.learn_more}
          </a>
        </div>
      </div>
    </>
  );
}
