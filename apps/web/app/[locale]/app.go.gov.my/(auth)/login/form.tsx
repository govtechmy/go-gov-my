'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { Button, Google, useMediaQuery } from '@dub/ui';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get('next');
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [noSuchAccount, setNoSuchAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const [clickedEmail, setClickedEmail] = useState(false);
  const [clickedSSO, setClickedSSO] = useState(false);
  const { messages, locale } = useIntlClientHook();
  const message = messages?.login;

  useEffect(() => {
    const error = searchParams?.get('error');
    error && toast.error(error);
  }, [searchParams]);

  const { isMobile } = useMediaQuery();

  useEffect(() => {
    // when leave page, reset state
    return () => {
      setClickedGoogle(false);
      setClickedEmail(false);
      setClickedSSO(false);
    };
  }, []);

  return (
    <>
      <div className="flex space-x-2">
        <Button
          variant="secondary"
          onClick={() => {
            setClickedGoogle(true);
            signIn('google', {
              ...(next && next.length > 0 ? { callbackUrl: next } : {}),
            });
          }}
          loading={clickedGoogle}
          disabled={clickedEmail || clickedSSO}
          icon={<Google className="h-5 w-5" />}
          text={message?.cont_google}
        />
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setClickedEmail(true);
          fetch('/api/auth/account-exists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          })
            .then(async (res) => {
              const { exists } = await res.json();
              if (exists) {
                signIn('email', {
                  email,
                  redirect: false,
                  ...(next && next.length > 0 ? { callbackUrl: next } : {}),
                }).then((res) => {
                  setClickedEmail(false);
                  if (res?.ok && !res?.error) {
                    setEmail('');
                    toast.success(message?.email_sent);
                  } else {
                    toast.error(message?.email_sent_error);
                  }
                });
              } else {
                toast.error(message?.no_account);
                setNoSuchAccount(true);
                setClickedEmail(false);
              }
            })
            .catch(() => {
              setClickedEmail(false);
              toast.error(message?.email_sent_error);
            });
        }}
        className="flex flex-col space-y-3"
      >
        {showEmailOption && (
          <div>
            <div className="mb-4 mt-1 border-t border-gray-300" />
            <input
              id="email"
              name="email"
              autoFocus={!isMobile}
              type="email"
              placeholder="e.g. officer@gov.my"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => {
                setNoSuchAccount(false);
                setEmail(e.target.value);
              }}
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm"
            />
          </div>
        )}
        <Button
          icon={<FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />}
          text="Continue with Email"
          variant="secondary"
          {...(!showEmailOption && {
            type: 'button',
            onClick: (e) => {
              e.preventDefault();
              setShowEmailOption(true);
            },
          })}
          loading={clickedEmail}
          disabled={clickedGoogle || clickedSSO}
        />
      </form>
      {noSuchAccount && (
        <p className="text-center text-sm text-red-500">{message?.no_account_v2}</p>
      )}
    </>
  );
}
