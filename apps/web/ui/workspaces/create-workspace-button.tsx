"use client";

import { ModalContext } from "@/ui/modals/provider";
import { Button } from "@dub/ui";
import { useContext } from "react";

export default function CreateWorkspaceButton() {
  const { setShowAddWorkspaceModal } = useContext(ModalContext);

  return (
    <div>
      <Button
        text="Create workspace"
        className="flex-shrink-0 truncate"
        onClick={() => setShowAddWorkspaceModal(true)}
      />
    </div>
  );
}
