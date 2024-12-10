import Page from '@/components/page/common/Page';
import SecureLinkContent from '@/components/page/secure/SecureLinkContent';
import { GOAPP_PARAM_AUTH_URL } from '@/constants/goapp';
import { getPageMetadata, type MetadataProps } from '@/lib/page';
import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: MetadataProps): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const title = t('metadata.secure.title');
  const description = t('metadata.secure.description');
  const imageUrl = t('metadata.site.openGraph.images.1.url');

  return getPageMetadata({
    title,
    description,
    imageUrl,
    siteName: t('app.name'),
  });
}

export default async function PageSecure({ params: { locale } }: PageProps) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <Page>
      <SecureLinkContent slug={GOAPP_PARAM_AUTH_URL} />
    </Page>
  );
}
