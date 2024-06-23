import { Button, Google, Logo, Modal } from "@dub/ui";
import Cookies from "js-cookie";
import { signIn } from "next-auth/react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

function GoogleOauthModal({
  showGoogleOauthModal,
  setShowGoogleOauthModal,
}: {
  showGoogleOauthModal: boolean;
  setShowGoogleOauthModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const { messages, locale } = useIntlClientHook();
  const message = messages?.modal;

  return (
    <Modal
      showModal={showGoogleOauthModal}
      setShowModal={setShowGoogleOauthModal}
    >
      <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 sm:px-16">
        <Logo />
        <h3 className="text-lg font-medium">{message?.google}</h3>
        <p className="text-center text-sm text-gray-500">
          {message?.google_desc_1} {process.env.NEXT_PUBLIC_APP_NAME}{" "}
          {message?.google_desc_2}{" "}
          <a
            className="underline underline-offset-4 transition-colors hover:text-black"
            href="https://dub.co/changelog/sign-in-with-google"
            target="_blank"
            rel="noopener noreferrer"
          >
            {message?.read_announcement}
          </a>
        </p>
      </div>
      <div className="flex flex-col space-y-3 bg-gray-50 px-4 py-8 text-left sm:px-16">
        <Button
          text={message?.connect_google}
          onClick={() => {
            setClickedGoogle(true);
            signIn("google", {
              callbackUrl: "/settings?google=true",
            });
          }}
          loading={clickedGoogle}
          icon={<Google className="h-4 w-4" />}
        />
        <button
          onClick={() => {
            setShowGoogleOauthModal(false);
            Cookies.set("hideGoogleOauthModal", true, { expires: 14 });
          }}
          className="text-sm text-gray-400 underline underline-offset-4 transition-colors hover:text-gray-800 active:text-gray-400"
        >
          {message?.dont_show}
        </button>
      </div>
    </Modal>
  );
}

export function useGoogleOauthModal() {
  const [showGoogleOauthModal, setShowGoogleOauthModal] = useState(false);

  const GoogleOauthModalCallback = useCallback(() => {
    return (
      <GoogleOauthModal
        showGoogleOauthModal={showGoogleOauthModal}
        setShowGoogleOauthModal={setShowGoogleOauthModal}
      />
    );
  }, [showGoogleOauthModal, setShowGoogleOauthModal]);

  return useMemo(
    () => ({
      setShowGoogleOauthModal,
      GoogleOauthModal: GoogleOauthModalCallback,
    }),
    [setShowGoogleOauthModal, GoogleOauthModalCallback],
  );
}
