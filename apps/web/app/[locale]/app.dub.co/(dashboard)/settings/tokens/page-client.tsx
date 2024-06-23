"use client";

import { useDeleteTokenModal } from "@/ui/modals/delete-token-modal";
import { useTokenCreatedModal } from "@/ui/modals/token-created-modal";
import { Form, IconMenu, LoadingSpinner, Popover, TokenAvatar } from "@dub/ui";
import { fetcher, timeAgo } from "@dub/utils";
import { Token } from "@prisma/client";
import { FolderOpen, MoreVertical, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

export default function TokensPageClient() {
  const {
    data: tokens,
    mutate,
    isLoading,
  } = useSWR<Token[]>("/api/user/tokens", fetcher);
  const { messages, locale } = useIntlClientHook();
  const message = messages?.tokens;

  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const { TokenCreatedModal, setShowTokenCreatedModal } = useTokenCreatedModal({
    token: createdToken || "",
  });
  return (
    <>
      <TokenCreatedModal />
      <Form
        title={message?.create_api_key}
        description={message?.enter_key}
        inputAttrs={{
          name: "name",
          defaultValue: "",
          placeholder: "Jetpack API Key",
          maxLength: 140,
        }}
        helpText={`<a href='https://d.to/api' target='_blank'>${message?.learn_more}</a>`}
        buttonText="Submit"
        handleSubmit={(data) =>
          fetch("/api/user/tokens", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }).then(async (res) => {
            if (res.status === 200) {
              const { token } = await res.json();
              setCreatedToken(token);
              setShowTokenCreatedModal(true);
              mutate();
              toast.success(message?.success);
            } else {
              const errorMessage = await res.text();
              toast.error(errorMessage || message?.error);
            }
          })
        }
      />
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col space-y-3 p-5 sm:p-10">
          <h2 className="text-xl font-medium">{message?.your_api_keys}</h2>
          <p className="text-sm text-gray-500">
            {message?.description}
          </p>
        </div>
        {isLoading || !tokens ? (
          <div className="flex flex-col items-center justify-center space-y-4 pb-20 pt-10">
            <LoadingSpinner className="h-6 w-6 text-gray-500" />
            <p className="text-sm text-gray-500">{message?.fetch_api}</p>
          </div>
        ) : tokens.length > 0 ? (
          <div>
            <div className="grid grid-cols-5 border-b border-gray-200 px-5 py-2 text-sm font-medium text-gray-500 sm:px-10">
              <div className="col-span-3">{message?.name}</div>
              <div>{message?.key}</div>
              <div className="text-center">{message?.last_used}</div>
            </div>
            <div className="divide-y divide-gray-200">
              {tokens.map((token) => (
                <TokenRow key={token.id} {...token} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 pb-20 pt-10">
            <FolderOpen className="h-6 w-6 text-gray-500" />
            <p className="text-sm text-gray-500">
              {message?.no_api_key}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

const TokenRow = (token: Token) => {
  const [openPopover, setOpenPopover] = useState(false);
  const { DeleteTokenModal, setShowDeleteTokenModal } = useDeleteTokenModal({
    token,
  });
  const { messages, locale } = useIntlClientHook();
  const message = messages?.token;
  return (
    <>
      <DeleteTokenModal />
      <div className="relative grid grid-cols-5 items-center px-5 py-3 sm:px-10">
        <div className="col-span-3 flex items-center space-x-3">
          <TokenAvatar id={token.id} />
          <div className="flex flex-col space-y-px">
            <p className="font-semibold text-gray-700">{token.name}</p>
            <p className="text-sm text-gray-500" suppressHydrationWarning>
              {message?.created} {timeAgo(token.createdAt, { withAgo: true })}
            </p>
          </div>
        </div>
        <div className="font-mono text-sm">{token.partialKey}</div>
        <div
          className="text-center text-sm text-gray-500"
          suppressHydrationWarning
        >
          {timeAgo(token.lastUsed)}
        </div>
        <Popover
          content={
            <div className="grid w-full gap-1 p-2 sm:w-48">
              <button
                onClick={() => {
                  setOpenPopover(false);
                  setShowDeleteTokenModal(true);
                }}
                className="rounded-md p-2 text-left text-sm font-medium text-red-600 transition-all duration-75 hover:bg-red-600 hover:text-white"
              >
                <IconMenu
                  text={message?.delete_api_key}
                  icon={<Trash className="h-4 w-4" />}
                />
              </button>
            </div>
          }
          align="end"
          openPopover={openPopover}
          setOpenPopover={setOpenPopover}
        >
          <button
            onClick={() => {
              setOpenPopover(!openPopover);
            }}
            className="absolute right-4 rounded-md px-1 py-2 transition-all duration-75 hover:bg-gray-100 active:bg-gray-200"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </Popover>
      </div>
    </>
  );
};
