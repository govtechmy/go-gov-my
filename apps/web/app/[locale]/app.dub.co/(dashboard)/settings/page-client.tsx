'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import DeleteAccountSection from '@/ui/account/delete-account';
import UploadAvatar from '@/ui/account/upload-avatar';
import { Form } from '@dub/ui';
import { APP_NAME } from '@dub/utils';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export default function SettingsPageClient() {
  const { data: session, update, status } = useSession();
  const { messages } = useIntlClientHook();
  const message = messages?.tokens;

  return (
    <>
      <Form
        title={message?.your_name}
        description={`${message?.display_name} ${APP_NAME}.`}
        inputAttrs={{
          name: 'name',
          defaultValue: status === 'loading' ? undefined : session?.user?.name || '',
          placeholder: 'Steve Jobs',
          maxLength: 32,
        }}
        buttonText={messages?.link?.save_changes}
        helpText={message?.max_char}
        handleSubmit={(data) =>
          fetch('/api/user', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }).then(async (res) => {
            if (res.status === 200) {
              update();
              toast.success(message?.success_update);
            } else {
              const { error } = await res.json();
              toast.error(error.message);
            }
          })
        }
      />
      <UploadAvatar />
      <DeleteAccountSection />
    </>
  );
}
