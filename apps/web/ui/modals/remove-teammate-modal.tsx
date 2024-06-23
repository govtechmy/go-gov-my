import useWorkspace from "@/lib/swr/use-workspace";
import { UserProps } from "@/lib/types";
import { Avatar, BlurImage, Button, Logo, Modal, useMediaQuery } from "@dub/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

function RemoveTeammateModal({
  showRemoveTeammateModal,
  setShowRemoveTeammateModal,
  user,
  invite,
}: {
  showRemoveTeammateModal: boolean;
  setShowRemoveTeammateModal: Dispatch<SetStateAction<boolean>>;
  user: UserProps;
  invite?: boolean;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const { id: workspaceId, name: workspaceName, logo } = useWorkspace();
  const { data: session } = useSession();
  const { id, name, email } = user;
  const { isMobile } = useMediaQuery();
  const { messages } = useIntlClientHook();
  const message = messages?.modal;

  return (
    <Modal
      showModal={showRemoveTeammateModal}
      setShowModal={setShowRemoveTeammateModal}
    >
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
        <h3 className="text-lg font-medium">
          {invite
            ? message?.revoke_invitation
            : session?.user?.email === email
              ? message?.leave_workspace
              : message?.remove_teammate}
        </h3>
        <p className="text-center text-sm text-gray-500">
          {invite
            ? message?.will_revoke
            : session?.user?.email === email
              ? message?.about_to_leave
              : message?.will_remove}
          <span className="font-semibold text-black">
            {session?.user?.email === email ? workspaceName : name || email}
          </span>
          {invite
            ? message?.invitation_workspace
            : session?.user?.email === email
              ? message?.lose_access
              : message?.from_your_workspace}
          {message?.are_you_sure}
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
          text={message?.confirm}
          variant="danger"
          autoFocus={!isMobile}
          loading={removing}
          onClick={() => {
            setRemoving(true);
            fetch(
              `/api/workspaces/${workspaceId}/${
                invite
                  ? `invites?email=${encodeURIComponent(email)}`
                  : `users?userId=${id}`
              }`,
              {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
              },
            ).then(async (res) => {
              if (res.status === 200) {
                await mutate(
                  `/api/workspaces/${workspaceId}/${invite ? "invites" : "users"}`,
                );
                if (session?.user?.email === email) {
                  await mutate("/api/workspaces");
                  router.push("/");
                } else {
                  setShowRemoveTeammateModal(false);
                }
                toast.success(
                  session?.user?.email === email
                    ? message?.left_workspace
                    : invite
                      ? message?.revoke_success
                      : message?.removed_teammate,
                );
              } else {
                const { error } = await res.json();
                toast.error(error.message);
              }
              setRemoving(false);
            });
          }}
        />
      </div>
    </Modal>
  );
}

export function useRemoveTeammateModal({
  user,
  invite,
}: {
  user: UserProps;
  invite?: boolean;
}) {
  const [showRemoveTeammateModal, setShowRemoveTeammateModal] = useState(false);

  const RemoveTeammateModalCallback = useCallback(() => {
    return (
      <RemoveTeammateModal
        showRemoveTeammateModal={showRemoveTeammateModal}
        setShowRemoveTeammateModal={setShowRemoveTeammateModal}
        user={user}
        invite={invite}
      />
    );
  }, [showRemoveTeammateModal, setShowRemoveTeammateModal]);

  return useMemo(
    () => ({
      setShowRemoveTeammateModal,
      RemoveTeammateModal: RemoveTeammateModalCallback,
    }),
    [setShowRemoveTeammateModal, RemoveTeammateModalCallback],
  );
}
