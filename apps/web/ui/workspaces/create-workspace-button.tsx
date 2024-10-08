'use client';

import { ModalContext } from '@/ui/modals/provider';
import { MessagesContext } from '@/ui/switcher/provider';
import { Button } from '@dub/ui';
import { useContext } from 'react';

export default function CreateWorkspaceButton() {
  const { setShowAddWorkspaceModal } = useContext(ModalContext);
  const messages = useContext(MessagesContext);

  return (
    <div>
      <Button
        text={messages?.dashboard?.create_workspace}
        className="flex-shrink-0 truncate"
        onClick={() => setShowAddWorkspaceModal(true)}
      />
    </div>
  );
}
