import useWorkspace from "@/lib/swr/use-workspace";
import { UserProps } from "@/lib/types";
import { Avatar, BlurImage, Button, Logo, Modal } from "@dub/ui";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";


function EditRoleModal({
  showEditRoleModal,
  setShowEditRoleModal,
  user,
  role,
}: {
  showEditRoleModal: boolean;
  setShowEditRoleModal: Dispatch<SetStateAction<boolean>>;
  user: UserProps;
  role: "owner" | "member";
}) {
  const [editing, setEditing] = useState(false);
  const { id, name: workspaceName, logo } = useWorkspace();
  const { id: userId, name, email } = user;
  const { messages } = useIntlClientHook();
  const message = messages?.modal;

  return (
    <Modal showModal={showEditRoleModal} setShowModal={setShowEditRoleModal}>
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 sm:px-16">
        {logo ? (
          <BlurImage
            src={logo}
            alt="Workspace logo"
            className="h-10 w-10 rounded-full"
            width={20}
            height={20}
          />
        ) : (
          <Logo />
        )}
        <h3 className="text-lg font-medium">{message?.change_teammate_role}</h3>
        <p className="text-center text-sm text-gray-500">
          {message?.change_role_desc_1} <b className="text-gray-800">{name || email}</b> 
          {message?.change_role_desc_2} <b className="text-gray-800">{workspaceName}</b> 
          {message?.change_role_desc_3} {" "}
          <b className="text-gray-800">{role}</b>. {message?.change_role_desc_4}
        </p>
      </div>

      <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 text-left sm:px-16">
        <div className="flex items-center space-x-3 rounded-md border border-gray-300 bg-white p-3">
          <Avatar user={user} />
          <div className="flex flex-col">
            <h3 className="text-sm font-medium">{name || email}</h3>
            <p className="text-xs text-gray-500">{email}</p>
          </div>
        </div>
        <Button
          text="Confirm"
          loading={editing}
          onClick={() => {
            setEditing(true);
            fetch(`/api/workspaces/${id}/users`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                role,
              }),
            }).then(async (res) => {
              if (res.status === 200) {
                await mutate(`/api/workspaces/${id}/users`);
                setShowEditRoleModal(false);
                toast.success(
                  `${message?.success_toast_1} ${name || email}${message?.success_toast_2} ${role}.`,
                );
              } else {
                const { error } = await res.json();
                toast.error(error.message);
              }
              setEditing(false);
            });
          }}
        />
      </div>
    </Modal>
  );
}

export function useEditRoleModal({
  user,
  role,
}: {
  user: UserProps;
  role: "owner" | "member";
}) {
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);

  const EditRoleModalCallback = useCallback(() => {
    return (
      <EditRoleModal
        showEditRoleModal={showEditRoleModal}
        setShowEditRoleModal={setShowEditRoleModal}
        user={user}
        role={role}
      />
    );
  }, [showEditRoleModal, setShowEditRoleModal]);

  return useMemo(
    () => ({
      setShowEditRoleModal,
      EditRoleModal: EditRoleModalCallback,
    }),
    [setShowEditRoleModal, EditRoleModalCallback],
  );
}
