'use client';

import { useState } from 'react';
import RedirectContent from '../common/RedirectContent';
import SecureLinkForm from './SecureLinkForm';
import Heading from '@/components/Heading';
import { Paragraph } from '@/components/Paragraph';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type Props = {
  slug: string;
};

const REDIRECT_SECONDS = 10;

export default function SecureLinkContent(props: Props) {
  const t = useTranslations();
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);

  if (destinationUrl) {
    return <RedirectContent redirectUrl={destinationUrl} redirectSeconds={REDIRECT_SECONDS} />;
  }

  return (
    <div className={cn('flex grow flex-col items-center justify-start tall:justify-center')}>
      <img width={32} height={32} src="/__goapp_public__/icons/padlock.svg" alt="Logo" />
      <Heading level={2} className={cn('text-center', 'mt-[0.75rem] md:mt-[1rem]')}>
        {t('pages.password.title')}
      </Heading>
      <Paragraph textSize="small" textAlign="center" className="mt-[0.75rem] md:mt-[1rem]">
        {t('pages.password.description')}
      </Paragraph>
      <SecureLinkForm slug={props.slug} onAuthenticated={setDestinationUrl} />
    </div>
  );
}
