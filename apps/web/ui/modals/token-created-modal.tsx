import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import { Button, CopyButton, Logo, Modal } from "@dub/ui";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";

function TokenCreatedModal({
  showTokenCreatedModal,
  setShowTokenCreatedModal,
  token,
}: {
  showTokenCreatedModal: boolean;
  setShowTokenCreatedModal: Dispatch<SetStateAction<boolean>>;
  token: string;
}) {
  const { messages, locale } = useIntlClientHook();
  const message = messages?.modal;
  return (
    <Modal
      showModal={showTokenCreatedModal}
      setShowModal={setShowTokenCreatedModal}
    >
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 sm:px-16">
        <Logo />
        <h3 className="text-lg font-medium">{message?.api_key_created}</h3>
        <p className="text-center text-sm text-gray-500">
          {message?.api_key_created_desc}
        </p>
      </div>

      <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 text-left sm:px-16">
        <div className="flex items-center justify-between rounded-md border border-gray-300 bg-white p-3">
          <p className="font-mono text-sm text-gray-500">{token}</p>
          <CopyButton value={token} className="rounded-md" />
        </div>
        <Button
          text={message?.done}
          variant="secondary"
          onClick={() => setShowTokenCreatedModal(false)}
        />
      </div>
    </Modal>
  );
}

export function useTokenCreatedModal({ token }: { token: string }) {
  const [showTokenCreatedModal, setShowTokenCreatedModal] = useState(false);

  const TokenCreatedModalCallback = useCallback(() => {
    return (
      <TokenCreatedModal
        showTokenCreatedModal={showTokenCreatedModal}
        setShowTokenCreatedModal={setShowTokenCreatedModal}
        token={token}
      />
    );
  }, [showTokenCreatedModal, setShowTokenCreatedModal]);

  return useMemo(
    () => ({
      setShowTokenCreatedModal,
      TokenCreatedModal: TokenCreatedModalCallback,
    }),
    [setShowTokenCreatedModal, TokenCreatedModalCallback],
  );
}
