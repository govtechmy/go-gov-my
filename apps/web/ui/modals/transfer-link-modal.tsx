import useWorkspace from "@/lib/swr/use-workspace";
import useWorkspaces from "@/lib/swr/use-workspaces";
import { LinkProps } from "@/lib/types";
import { Button, InputSelect, InputSelectItemProps, Modal } from "@dub/ui";
import {
  APP_NAME,
  DICEBEAR_AVATAR_URL,
  getApexDomain,
  isDubDomain,
  linkConstructor,
} from "@dub/utils";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { mutate } from "swr";
import LinkLogo from "../links/link-logo";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

function TransferLinkModal({
  showTransferLinkModal,
  setShowTransferLinkModal,
  props,
}: {
  showTransferLinkModal: boolean;
  setShowTransferLinkModal: Dispatch<SetStateAction<boolean>>;
  props: LinkProps;
}) {
  const { messages, locale } = useIntlClientHook();
  const message = messages?.modal;
  const { id } = useWorkspace();
  const { workspaces } = useWorkspaces();
  const [transferring, setTransferring] = useState(false);
  const [selectedWorkspace, setselectedWorkspace] =
    useState<InputSelectItemProps | null>(null);

  const apexDomain = getApexDomain(props.url);
  const { key, domain } = props;

  const shortlink = useMemo(() => {
    return linkConstructor({
      key,
      domain,
      pretty: true,
    });
  }, [key, domain]);

  const transferLink = async (linkId: string, newWorkspaceId: string) => {
    return await fetch(`/api/links/${linkId}/transfer?workspaceId=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newWorkspaceId }),
    }).then(async (res) => {
      if (res.ok) {
        mutate(
          (key) => typeof key === "string" && key.startsWith("/api/links"),
          undefined,
          { revalidate: true },
        );
        setShowTransferLinkModal(false);
        return true;
      } else {
        const error = await res.json();
        throw new Error(error.message);
      }
    });
  };

  return (
    <Modal
      showModal={showTransferLinkModal}
      setShowModal={setShowTransferLinkModal}
      className="overflow-visible"
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (selectedWorkspace) {
            setTransferring(true);
            toast.promise(transferLink(props.id, selectedWorkspace.id), {
              loading: message?.transfer_link_loading,
              success: message?.transfer_link_successful,
              error: message?.transfer_link_failed,
            });
          }
        }}
      >
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 text-center sm:px-16">
          <LinkLogo apexDomain={apexDomain} />
          <h3 className="text-lg font-medium">{message?.transfer} {shortlink}</h3>
          <p className="text-sm text-gray-500">
            {message?.transfer_desc_1} {APP_NAME}{" "} {message?.transfer_desc_2}
          </p>
        </div>

        <div className="flex flex-col space-y-28 bg-gray-50 px-4 py-8 text-left sm:space-y-3 sm:rounded-b-2xl sm:px-16">
          <InputSelect
            items={
              workspaces
                ? workspaces.map((workspace) => ({
                    id: workspace.id,
                    value: workspace.name,
                    image:
                      workspace.logo ||
                      `${DICEBEAR_AVATAR_URL}${workspace.name}`,
                    disabled:
                      workspace.id.replace("ws_", "") === props.projectId,
                    label:
                      workspace.id.replace("ws_", "") === props.projectId
                        ? message?.current
                        : "",
                  }))
                : []
            }
            selectedItem={selectedWorkspace}
            setSelectedItem={setselectedWorkspace}
            inputAttrs={{
              placeholder: "Select a workspace",
            }}
          />
          <Button
            disabled={!selectedWorkspace || !isDubDomain(domain)}
            loading={transferring}
            text={message?.confirm_transfer}
          />
        </div>
      </form>
    </Modal>
  );
}

export function useTransferLinkModal({ props }: { props: LinkProps }) {
  const [showTransferLinkModal, setShowTransferLinkModal] = useState(false);

  const TransferLinkModalCallback = useCallback(() => {
    return props ? (
      <TransferLinkModal
        showTransferLinkModal={showTransferLinkModal}
        setShowTransferLinkModal={setShowTransferLinkModal}
        props={props}
      />
    ) : null;
  }, [showTransferLinkModal, setShowTransferLinkModal]);

  return useMemo(
    () => ({
      setShowTransferLinkModal,
      TransferLinkModal: TransferLinkModalCallback,
    }),
    [setShowTransferLinkModal, TransferLinkModalCallback],
  );
}
