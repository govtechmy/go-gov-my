"use client";

import { Button, Google, useMediaQuery } from "@dub/ui";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { allowedDomain } from "./allowedDomain";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const [showEmailOption, setShowEmailOption] = useState(false);
  const [noSuchAccount, setNoSuchAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const [clickedGithub, setClickedGithub] = useState(false);
  const [clickedEmail, setClickedEmail] = useState(false);
  const [clickedSSO, setClickedSSO] = useState(false);

  useEffect(() => {
    const error = searchParams?.get("error");
    error && toast.error(error);
  }, [searchParams]);

  const { isMobile } = useMediaQuery();

  const isLocal = process.env.ENVIRONMENT === "local";

  const validateEmailDomain = (email: string) => {
    if (!isLocal) return true;
    return email.endsWith("gov.my");
  };

  useEffect(() => {
    // when leave page, reset state
    return () => {
      setClickedGoogle(false);
      setClickedGithub(false);
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
            signIn("google", {
              ...(next && next.length > 0 ? { callbackUrl: next } : {}),
            });
          }}
          loading={clickedGoogle}
          disabled={clickedEmail || clickedSSO}
          icon={<Google className="h-5 w-5" />}
          text="Continue with Google"
        />
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!allowedDomain(email, isLocal)) {
            toast.error(
              "Email must be a government email ending with an allowed domain.",
            );
            return;
          }
          setClickedEmail(true);
          fetch("/api/auth/account-exists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
            .then(async (res) => {
              const { exists } = await res.json();
              if (exists) {
                signIn("email", {
                  email,
                  redirect: false,
                  ...(next && next.length > 0 ? { callbackUrl: next } : {}),
                }).then((res) => {
                  setClickedEmail(false);
                  if (res?.ok && !res?.error) {
                    setEmail("");
                    toast.success("Email sent - check your inbox!");
                  } else {
                    toast.error("Error sending email - try again?");
                  }
                });
              } else {
                toast.error("No account found with that email address.");
                setNoSuchAccount(true);
                setClickedEmail(false);
              }
            })
            .catch(() => {
              setClickedEmail(false);
              toast.error("Error sending email - try again?");
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
            type: "button",
            onClick: (e) => {
              e.preventDefault();
              setShowEmailOption(true);
            },
          })}
          loading={clickedEmail}
          disabled={clickedGoogle || clickedSSO}
        />
      </form>
    </>
  );
}
