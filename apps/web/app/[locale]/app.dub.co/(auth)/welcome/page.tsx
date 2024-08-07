import { useIntlHook } from "@/lib/middleware/utils/useI18n";
import { Background } from "@dub/ui";
import { constructMetadata } from "@dub/utils";
import { Suspense } from "react";
import WelcomePageClient from "./page-client";

export const runtime = "nodejs";

export async function generateMetadata({ params }) {
  const { locale } = params;
  const { messages } = useIntlHook(locale);
  return constructMetadata({
    title: `${messages?.metadata?.welcome_to} ${process.env.NEXT_PUBLIC_APP_NAME}`,
  });
}

export default function WelcomePage() {
  return (
    <>
      <Background />
      <Suspense>
        <WelcomePageClient />
      </Suspense>
    </>
  );
}
