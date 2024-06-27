"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import LinksContainer from "@/ui/links/links-container";
import { useAddEditLinkModal } from "@/ui/modals/add-edit-link-modal";
import { MaxWidthWrapper } from "@dub/ui";

export default function WorkspaceLinksClient() {
  const { AddEditLinkModal, AddEditLinkButton } = useAddEditLinkModal();
  const { messages } = useIntlClientHook();
  return (
    <>
      <AddEditLinkModal />
      <div className="flex h-36 items-center border-b border-gray-200 bg-white">
        <MaxWidthWrapper>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl text-gray-600">
              {messages?.dashboard?.Links}
            </h1>
            <div className="flex">
              <AddEditLinkButton />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
      <LinksContainer AddEditLinkButton={AddEditLinkButton} />
    </>
  );
}
