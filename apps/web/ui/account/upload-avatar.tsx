"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import { Button, FileUpload } from "@dub/ui";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UploadAvatar() {
  const { data: session, update } = useSession();
  const { messages } = useIntlClientHook();

  const [image, setImage] = useState<string | null>();

  useEffect(() => {
    setImage(
      session?.user?.image ||
        (session?.user?.email
          ? `https://api.dicebear.com/7.x/micah/svg?seed=${session?.user?.email}`
          : null),
    );
  }, [session]);

  const [uploading, setUploading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        setUploading(true);
        e.preventDefault();
        fetch("/api/user", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image }),
        }).then(async (res) => {
          setUploading(false);
          if (res.status === 200) {
            await update();
            toast.success(messages?.settings?.success_updated_picture);
          } else {
            const errorMessage = await res.text();
            toast.error(errorMessage || messages?.settings?.error);
          }
        });
      }}
      className="rounded-lg border border-gray-200 bg-white"
    >
      <div className="flex flex-col space-y-3 p-5 sm:p-10">
        <h2 className="text-xl font-medium">
          {messages?.settings?.your_avatar}
        </h2>
        <p className="text-sm text-gray-500">
          {messages?.settings?.this_avatar} {process.env.NEXT_PUBLIC_APP_NAME}.
        </p>
        <div className="mt-1">
          <FileUpload
            accept="images"
            className="h-24 w-24 rounded-full border border-gray-300"
            iconClassName="w-5 h-5"
            variant="plain"
            imageSrc={image}
            readFile
            onChange={({ src }) => setImage(src)}
            content={null}
            maxFileSizeMB={2}
          />
        </div>
      </div>

      <div className="flex items-center justify-between space-x-4 rounded-b-lg border-t border-gray-200 bg-gray-50 p-3 sm:px-10">
        <p className="text-sm text-gray-500">
          {messages?.settings?.size_notice}
        </p>
        <div className="shrink-0">
          <Button
            text={messages?.link?.save_changes}
            loading={uploading}
            disabled={!image || session?.user?.image === image}
          />
        </div>
      </div>
    </form>
  );
}
