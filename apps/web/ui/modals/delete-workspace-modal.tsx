import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useWorkspace from '@/lib/swr/use-workspace';
import { Button, Logo, Modal, useMediaQuery } from '@dub/ui';
import { cn, fetcher } from '@dub/utils';
import { useParams, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';

function DeleteWorkspaceModal({
  showDeleteWorkspaceModal,
  setShowDeleteWorkspaceModal,
}: {
  showDeleteWorkspaceModal: boolean;
  setShowDeleteWorkspaceModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const { id, isOwner } = useWorkspace();
  const { messages, locale } = useIntlClientHook();
  const message = messages?.modal;

  const [deleting, setDeleting] = useState(false);

  async function deleteWorkspace() {
    return new Promise((resolve, reject) => {
      setDeleting(true);
      fetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(async (res) => {
        if (res.ok) {
          mutate('/api/workspaces?', fetcher('/api/workspaces'));
          router.push(`/${locale}`);
          resolve(null);
        } else {
          setDeleting(false);
          const error = await res.text();
          reject(error);
        }
      });
    });
  }

  const { isMobile } = useMediaQuery();

  return (
    <Modal showModal={showDeleteWorkspaceModal} setShowModal={setShowDeleteWorkspaceModal}>
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 sm:px-16">
        <Logo />
        <h3 className="text-lg font-medium">{message?.delete_workspace}</h3>
        <p className="text-center text-sm text-gray-500">{message?.delete_workspace_desc}</p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          toast.promise(deleteWorkspace(), {
            loading: message?.deleting_workspace,
            success: message?.delete_workspace_success,
            error: (err) => err,
          });
        }}
        className="flex flex-col space-y-6 bg-gray-50 px-4 py-8 text-left sm:px-16"
      >
        <div>
          <label htmlFor="workspace-slug" className="block text-sm font-medium text-gray-700">
            {message?.enter_workspace_slug} <span className="font-semibold text-black">{slug}</span>{' '}
            {message?.to_continue}
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="workspace-slug"
              id="workspace-slug"
              autoFocus={!isMobile}
              autoComplete="off"
              pattern={slug}
              disabled={!isOwner}
              className={cn(
                'block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm',
                {
                  'cursor-not-allowed bg-gray-100': !isOwner,
                }
              )}
            />
          </div>
        </div>

        <div>
          <label htmlFor="verification" className="block text-sm text-gray-700">
            {message?.to_verify}{' '}
            <span className="font-semibold text-black">{message?.confirm_delete_workspace}</span>{' '}
            {message?.below}
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="verification"
              id="verification"
              pattern={message?.confirm_delete_workspace}
              required
              autoComplete="off"
              disabled={!isOwner}
              className={cn(
                'block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm',
                {
                  'cursor-not-allowed bg-gray-100': !isOwner,
                }
              )}
            />
          </div>
        </div>

        <Button
          text={message?.confirm_delete_workspace}
          variant="danger"
          loading={deleting}
          {...(!isOwner && {
            disabledTooltip: messages?.workspace?.only_owner,
          })}
        />
      </form>
    </Modal>
  );
}

export function useDeleteWorkspaceModal() {
  const [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal] = useState(false);

  const DeleteWorkspaceModalCallback = useCallback(() => {
    return (
      <DeleteWorkspaceModal
        showDeleteWorkspaceModal={showDeleteWorkspaceModal}
        setShowDeleteWorkspaceModal={setShowDeleteWorkspaceModal}
      />
    );
  }, [showDeleteWorkspaceModal, setShowDeleteWorkspaceModal]);

  return useMemo(
    () => ({
      setShowDeleteWorkspaceModal,
      DeleteWorkspaceModal: DeleteWorkspaceModalCallback,
    }),
    [setShowDeleteWorkspaceModal, DeleteWorkspaceModalCallback]
  );
}
