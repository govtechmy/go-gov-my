import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useWorkspace from '@/lib/swr/use-workspace';
import { LinkProps } from '@/lib/types';
import { Button, Modal, useMediaQuery } from '@dub/ui';
import { getApexDomain, linkConstructor } from '@dub/utils';
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import LinkLogo from '../links/link-logo';

function DeleteLinkModal({
  showDeleteLinkModal,
  setShowDeleteLinkModal,
  props,
}: {
  showDeleteLinkModal: boolean;
  setShowDeleteLinkModal: Dispatch<SetStateAction<boolean>>;
  props: LinkProps;
}) {
  const { id } = useWorkspace();
  const [deleting, setDeleting] = useState(false);
  const apexDomain = getApexDomain(props.url);
  const { messages, locale } = useIntlClientHook();
  const message = messages?.modal;

  const { key, domain } = props;

  const shortlink = useMemo(() => {
    return linkConstructor({
      key,
      domain,
      pretty: true,
    });
  }, [key, domain]);

  const { isMobile } = useMediaQuery();

  return (
    <Modal showModal={showDeleteLinkModal} setShowModal={setShowDeleteLinkModal}>
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 text-center sm:px-16">
        <LinkLogo apexDomain={apexDomain} />
        <h3 className="text-lg font-medium">
          {message?.delete} {shortlink}
        </h3>
        <p className="text-sm text-gray-500">{message?.delete}</p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setDeleting(true);
          fetch(`/api/links/${props.id}?workspaceId=${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(async (res) => {
            if (res.status === 200) {
              await mutate(
                (key) => typeof key === 'string' && key.startsWith('/api/links'),
                undefined,
                { revalidate: true }
              );
              setShowDeleteLinkModal(false);
              toast.success(message?.delete_link_success);
            } else {
              const { error } = await res.json();
              toast.error(error.message);
            }
            setDeleting(false);
          });
        }}
        className="flex flex-col space-y-3 bg-gray-50 px-4 py-8 text-left sm:px-16"
      >
        <div>
          <label htmlFor="verification" className="block text-sm text-gray-700">
            {message?.to_verify} <span className="font-semibold">{shortlink}</span> {message?.below}
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="verification"
              id="verification"
              pattern={shortlink}
              required
              autoFocus={!isMobile}
              autoComplete="off"
              className="block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
            />
          </div>
        </div>

        <Button variant="danger" text={message?.confirm_delete} loading={deleting} />
      </form>
    </Modal>
  );
}

export function useDeleteLinkModal({ props }: { props?: LinkProps }) {
  const [showDeleteLinkModal, setShowDeleteLinkModal] = useState(false);

  const DeleteLinkModalCallback = useCallback(() => {
    return props ? (
      <DeleteLinkModal
        showDeleteLinkModal={showDeleteLinkModal}
        setShowDeleteLinkModal={setShowDeleteLinkModal}
        props={props}
      />
    ) : null;
  }, [showDeleteLinkModal, setShowDeleteLinkModal]);

  return useMemo(
    () => ({
      setShowDeleteLinkModal,
      DeleteLinkModal: DeleteLinkModalCallback,
    }),
    [setShowDeleteLinkModal, DeleteLinkModalCallback]
  );
}
