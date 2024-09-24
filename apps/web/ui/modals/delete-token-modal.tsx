import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import {
  Badge,
  Button,
  Logo,
  Modal,
  TokenAvatar,
  useMediaQuery,
} from '@dub/ui';
import { timeAgo } from '@dub/utils';
import { Token } from '@prisma/client';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

function DeleteTokenModal({
  showDeleteTokenModal,
  setShowDeleteTokenModal,
  token,
}: {
  showDeleteTokenModal: boolean;
  setShowDeleteTokenModal: Dispatch<SetStateAction<boolean>>;
  token: Token;
}) {
  const [removing, setRemoving] = useState(false);
  const { messages, locale } = useIntlClientHook();
  const message = messages?.modal;

  const { isMobile } = useMediaQuery();

  return (
    <Modal
      showModal={showDeleteTokenModal}
      setShowModal={setShowDeleteTokenModal}
    >
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 sm:px-16">
        <Logo />
        <h3 className="text-lg font-medium">{message?.delete_api_key}</h3>
        <p className="text-center text-sm text-gray-500">
          {message?.delete_api_desc}
        </p>
      </div>

      <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 text-left sm:px-16">
        <div className="relative flex items-center space-x-3 rounded-md border border-gray-300 bg-white px-1 py-3">
          <Badge variant="neutral" className="absolute right-2 top-2">
            {token.partialKey}
          </Badge>
          <TokenAvatar id={token.id} />
          <div className="flex flex-col">
            <h3 className="line-clamp-1 w-48 font-semibold text-gray-700">
              {token.name}
            </h3>
            <p className="text-xs text-gray-500" suppressHydrationWarning>
              {message?.delete_api_desc}{' '}
              {timeAgo(token.lastUsed, { withAgo: true })}
            </p>
          </div>
        </div>
        <Button
          text={message?.confirm}
          variant="danger"
          autoFocus={!isMobile}
          loading={removing}
          onClick={() => {
            setRemoving(true);
            fetch(`/api/user/tokens?id=${token.id}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
            }).then(async (res) => {
              setRemoving(false);
              if (res.status === 200) {
                toast.success(message?.success_delete_api);
                mutate('/api/user/tokens');
                setShowDeleteTokenModal(false);
              } else {
                const error = await res.text();
                toast.error(error);
              }
            });
          }}
        />
      </div>
    </Modal>
  );
}

export function useDeleteTokenModal({ token }: { token: Token }) {
  const [showDeleteTokenModal, setShowDeleteTokenModal] = useState(false);

  const DeleteTokenModalCallback = useCallback(() => {
    return (
      <DeleteTokenModal
        showDeleteTokenModal={showDeleteTokenModal}
        setShowDeleteTokenModal={setShowDeleteTokenModal}
        token={token}
      />
    );
  }, [showDeleteTokenModal, setShowDeleteTokenModal]);

  return useMemo(
    () => ({
      setShowDeleteTokenModal,
      DeleteTokenModal: DeleteTokenModalCallback,
    }),
    [setShowDeleteTokenModal, DeleteTokenModalCallback],
  );
}
