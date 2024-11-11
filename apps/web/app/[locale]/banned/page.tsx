import { nonHooki18nFunc, useIntlHook } from '@/lib/middleware/utils/useI18n';
import { Background, Footer, Nav } from '@dub/ui';
import { APP_NAME, constructMetadata } from '@dub/utils';
import { ShieldBan } from 'lucide-react';

export const runtime = 'edge';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const { messages } = nonHooki18nFunc(locale);
  return constructMetadata({
    locale,
    title: `${messages?.metadata?.banned_link} – ${APP_NAME}`,
    description: messages?.metadata?.banned_desc,
    noIndex: true,
  });
}

export default async function BannedPage() {
  const { messages } = useIntlHook();
  const message = messages?.banned;
  return (
    <main className="flex min-h-screen flex-col justify-between">
      <Nav />
      <div className="z-10 mx-2 my-10 flex max-w-md flex-col items-center space-y-5 px-2.5 text-center sm:mx-auto sm:max-w-lg sm:px-0 lg:mb-16">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gray-300 bg-white/30">
          <ShieldBan className="h-6 w-6 text-gray-400" />
        </div>
        <h1 className="font-display text-5xl font-bold">{message?.banned_link}</h1>
        <p className="text-lg text-gray-600">{message?.banned_desc}</p>
        <a
          href="https://go.gov.my"
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
