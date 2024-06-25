"use client";
import { useDeleteAccountModal } from "@/ui/modals/delete-account-modal";
import { Button } from "@dub/ui";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

export default function DeleteAccountSection() {
  const { setShowDeleteAccountModal, DeleteAccountModal } =
    useDeleteAccountModal();
    const { messages } = useIntlClientHook();
    const message = messages?.account

  return (
    <div className="rounded-lg border border-red-600 bg-white">
      <DeleteAccountModal />
      <div className="flex flex-col space-y-3 p-5 sm:p-10">
        <h2 className="text-xl font-medium">{message?.delete_account}</h2>
        <p className="text-sm text-gray-500">
          {message?.delete_desc_p1} {process.env.NEXT_PUBLIC_APP_NAME} {message?.delete_desc_p2}
        </p>
      </div>
      <div className="border-b border-red-600" />

      <div className="flex items-center justify-end p-3 sm:px-10">
        <div>
          <Button
            text={message?.delete_account}
            variant="danger"
            onClick={() => setShowDeleteAccountModal(true)}
          />
        </div>
      </div>
    </div>
  );
}
