import { nonHooki18nFunc } from "@/lib/middleware/utils/useI18n";
import { getLink } from "@/lib/userinfos";
import Analytics from "@/ui/analytics";
import { APP_DOMAIN, constructMetadata, SHORT_DOMAIN } from "@dub/utils";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: { key: string; locale: string };
}) {
  const domain = SHORT_DOMAIN;
  const data = await getLink({ domain, key: params.key });

  // if the link doesn't exist or is explicitly private (publicStats === false)
  if (!data?.publicStats) {
    return;
  }
  const { messages } = nonHooki18nFunc(params.locale);
  return constructMetadata({
    title: `${messages?.metadata?.analytics} ${domain}/${params.key} – ${process.env.NEXT_PUBLIC_APP_NAME}`,
    image: `${APP_DOMAIN}/api/og/analytics?domain=${domain}&key=${params.key}`,
  });
}

export default async function StatsPage({
  params,
}: {
  params: { key: string };
}) {
  const domain = SHORT_DOMAIN;
  const data = await getLink({ domain, key: params.key });

  if (!data?.publicStats) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="h-screen w-full bg-gray-50" />}>
      {data && data.url && (
        <Analytics staticDomain={domain} staticUrl={data.url} />
      )}
    </Suspense>
  );
}
