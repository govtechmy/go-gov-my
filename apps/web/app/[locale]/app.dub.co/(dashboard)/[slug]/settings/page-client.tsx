"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import useWorkspace from "@/lib/swr/use-workspace";
import DeleteWorkspace from "@/ui/workspaces/delete-workspace";
import UploadLogo from "@/ui/workspaces/upload-logo";
import WorkspaceId from "@/ui/workspaces/workspace-id";
import { Form } from "@dub/ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { mutate } from "swr";

export default function WorkspaceSettingsClient() {
  const router = useRouter();
  const { id, name, slug, isOwner } = useWorkspace();
  const { messages, locale } = useIntlClientHook();
  const message = messages?.dashboard;

  return (
    <>
      <Form
        title={message?.workspace_name}
        description={`${message?.workspace_desc} ${process.env.NEXT_PUBLIC_APP_NAME}.`}
        inputAttrs={{
          name: "name",
          defaultValue: name,
          placeholder: message?.my_workspace,
          maxLength: 32,
        }}
        helpText={message?.max_characters}
        buttonText={messages?.link?.save_changes}
        {...(!isOwner && {
          disabledTooltip: message?.only_owners,
        })}
        handleSubmit={(updateData) =>
          fetch(`/api/workspaces/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          }).then(async (res) => {
            if (res.status === 200) {
              await Promise.all([
                mutate("/api/workspaces"),
                mutate(`/api/workspaces/${id}`),
              ]);
              toast.success(message?.success_update);
            } else {
              const { error } = await res.json();
              toast.error(error.message);
            }
          })
        }
      />
      <Form
        title={message?.workspace_slug}
        description={`${message?.slug_desc} ${process.env.NEXT_PUBLIC_APP_NAME}.`}
        inputAttrs={{
          name: "slug",
          defaultValue: slug,
          placeholder: "my-workspace",
          pattern: "^[a-z0-9-]+$",
          maxLength: 48,
        }}
        helpText={message?.help_text}
        buttonText={messages?.link?.save_changes}
        {...(!isOwner && {
          disabledTooltip: message?.only_owners_slug,
        })}
        handleSubmit={(data) =>
          fetch(`/api/workspaces/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }).then(async (res) => {
            if (res.status === 200) {
              const { slug: newSlug } = await res.json();
              await mutate("/api/workspaces");
              router.push(`/${locale}/${newSlug}/settings`);
              toast.success(message?.success_update_slug);
            } else {
              const { error } = await res.json();
              toast.error(error.message);
            }
          })
        }
      />
      <WorkspaceId />
      <UploadLogo />
      <DeleteWorkspace />
    </>
  );
}
