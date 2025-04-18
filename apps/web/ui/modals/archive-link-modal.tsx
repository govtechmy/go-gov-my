import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useWorkspace from '@/lib/swr/use-workspace';
import { LinkProps } from '@/lib/types';
import { Button, Modal, useToastWithUndo } from '@dub/ui';
import { getApexDomain, linkConstructor } from '@dub/utils';
import { Dispatch, MouseEvent, SetStateAction, useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import LinkLogo from '../links/link-logo';

const sendArchiveRequest = ({
  linkId,
  archive,
  workspaceId,
}: {
  linkId: string;
  archive: boolean;
  workspaceId?: string;
}) => {
  return fetch(`/api/links/${linkId}?workspaceId=${workspaceId}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: archive }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

const revalidateLinks = () => {
  return mutate((key) => typeof key === 'string' && key.startsWith('/api/links'), undefined, {
    revalidate: true,
  });
};

function ArchiveLinkModal({
  showArchiveLinkModal,
  setShowArchiveLinkModal,
  props,
}: {
  showArchiveLinkModal: boolean;
  setShowArchiveLinkModal: Dispatch<SetStateAction<boolean>>;
  props: LinkProps;
}) {
  const toastWithUndo = useToastWithUndo();
  const { messages, locale } = useIntlClientHook();
  const message = messages?.modal;

  const { id: workspaceId } = useWorkspace();
  const [archiving, setArchiving] = useState(false);
  const apexDomain = getApexDomain(props.url);

  const { key, domain } = props;

  const shortlink = useMemo(() => {
    return linkConstructor({
      key,
      domain,
      pretty: true,
    });
  }, [key, domain]);

  const handleArchiveRequest = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    setArchiving(true);
    const res = await sendArchiveRequest({
      linkId: props.id,
      archive: !props.archived,
      workspaceId,
    });
    setArchiving(false);

    if (!res.ok) {
      const { error } = await res.json();
      toast.error(error.message);
      return;
    }

    revalidateLinks();
    setShowArchiveLinkModal(false);
    toastWithUndo({
      id: 'link-archive-undo-toast',
      message: `Successfully ${props.archived ? 'unarchived' : 'archived'} link!`,
      undo: undoAction,
      duration: 5000,
    });
  };

  const undoAction = () => {
    toast.promise(
      sendArchiveRequest({
        linkId: props.id,
        archive: props.archived,
        workspaceId,
      }),
      {
        loading: message?.undo_in_progress,
        error: message?.fail_to_rollback,
        success: () => {
          revalidateLinks();
          return message?.undo_successful;
        },
      }
    );
  };

  return (
    <Modal showModal={showArchiveLinkModal} setShowModal={setShowArchiveLinkModal}>
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 text-center sm:px-16">
        <LinkLogo apexDomain={apexDomain} />
        <h3 className="text-lg font-medium">
          {props.archived ? message?.unarchive : message?.archive} {shortlink}
        </h3>
        <p className="text-sm text-gray-500">
          {props.archived ? message?.unarchive_desc : message?.archive_desc}
        </p>
      </div>

      <div className="flex flex-col space-y-6 bg-gray-50 px-4 py-8 text-left sm:px-16">
        <Button
          onClick={handleArchiveRequest}
          autoFocus
          loading={archiving}
          text={`${message?.confirm} ${props.archived ? message?.unarchive : message?.archive}`}
        />
      </div>
    </Modal>
  );
}

export function useArchiveLinkModal({ props }: { props: LinkProps }) {
  const [showArchiveLinkModal, setShowArchiveLinkModal] = useState(false);

  const ArchiveLinkModalCallback = useCallback(() => {
    return props ? (
      <ArchiveLinkModal
        showArchiveLinkModal={showArchiveLinkModal}
        setShowArchiveLinkModal={setShowArchiveLinkModal}
        props={props}
      />
    ) : null;
  }, [showArchiveLinkModal, setShowArchiveLinkModal]);

  return useMemo(
    () => ({
      setShowArchiveLinkModal,
      ArchiveLinkModal: ArchiveLinkModalCallback,
    }),
    [setShowArchiveLinkModal, ArchiveLinkModalCallback]
  );
}
