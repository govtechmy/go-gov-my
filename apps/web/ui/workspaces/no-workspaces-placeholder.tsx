"use client";

import { ModalContext } from "@/ui/modals/provider";
import { useContext } from "react";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

export default function NoWorkspacesPlaceholder() {
  const { setShowAddWorkspaceModal } = useContext(ModalContext);
  const { messages, locale } = useIntlClientHook();

  return (
    <div className="col-span-3 flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white py-12">
      <h2 className="z-10 text-xl font-semibold text-gray-700">
        {messages?.workspace?.dont_have}
      </h2>
      <img
        src="/_static/illustrations/shopping-call.svg"
        alt="No links yet"
        width={400}
        height={400}
        className="pointer-events-none -my-8"
      />
      <button
        onClick={() => setShowAddWorkspaceModal(true)}
        className="rounded-md border border-black bg-black px-10 py-2 text-sm font-medium text-white transition-all duration-75 hover:bg-white hover:text-black active:scale-95"
      >
        {messages?.workspace?.create}
      </button>
    </div>
  );
}
