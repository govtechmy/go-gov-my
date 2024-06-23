import { Background, Footer, Nav } from "@dub/ui";
import { APP_NAME, constructMetadata } from "@dub/utils";
import { TimerOff } from "lucide-react";
import { useIntlHook } from "@/lib/middleware/utils/useI18n";

export const runtime = "edge";

export const metadata = constructMetadata({
  title: `Expired Link – ${APP_NAME}`,
  description:
    "This link has expired. Please contact the owner of this link to get a new one.",
  noIndex: true,
});

export default async function ExpiredPage({
  params,
}: {
  params: { domain: string };
}) {
  const { messages } = useIntlHook();
  const message = messages?.expired
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Nav />
      <div className="z-10 mx-2 my-10 flex max-w-md flex-col items-center space-y-5 px-2.5 text-center sm:mx-auto sm:max-w-lg sm:px-0 lg:mb-16">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gray-300 bg-white/30">
          <TimerOff className="h-6 w-6 text-gray-400" />
        </div>
        <h1 className="font-display text-5xl font-bold">{message?.expired_link}</h1>
        <p className="text-lg text-gray-600">
          {message?.expired_desc}
        </p>
        <a
          href="https://dub.co"
          className="rounded-full bg-gray-800 px-10 py-2 font-medium text-white transition-colors hover:bg-black"
        >
          {message?.create}
        </a>
      </div>
      <Footer />
      <Background />
    </main>
  );
}
