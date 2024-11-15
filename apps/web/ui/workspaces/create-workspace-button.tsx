'use client';

import { ModalContext } from '@/ui/modals/provider';
import { MessagesContext } from '@/ui/switcher/provider';
import { Button } from '@dub/ui';
import { useContext, useCallback, useEffect } from 'react';

export default function CreateWorkspaceButton() {
  const { setShowAddWorkspaceModal } = useContext(ModalContext);
  const messages = useContext(MessagesContext);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const existingModalBackdrop = document.getElementById('modal-backdrop');

      if (
        e.key.toLowerCase() === 'c' &&
        !e.metaKey &&
        !e.ctrlKey &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !existingModalBackdrop
      ) {
        e.preventDefault();
        setShowAddWorkspaceModal(true);
      }
    },
    [setShowAddWorkspaceModal]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div>
      <Button
        text={messages?.dashboard?.create_workspace}
        className="flex-shrink-0 truncate font-poppins"
        shortcut="C"
        variant="success"
        onClick={() => setShowAddWorkspaceModal(true)}
      />
    </div>
  );
}
