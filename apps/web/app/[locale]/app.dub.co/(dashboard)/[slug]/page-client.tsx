'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useLinks from '@/lib/swr/use-links';
import { useParams, useRouter } from 'next/navigation';

import LinksContainer from '@/ui/links/links-container';
import { useAddEditLinkModal } from '@/ui/modals/add-edit-link-modal';
import PageTitle from '@/ui/typography/page-title';
import { MaxWidthWrapper } from '@dub/ui';
import { Button } from '@dub/ui/src/button';
import { LinkButton } from '@dub/ui/src/link-button';
import { cn } from '@dub/utils';
import { saveAs } from 'file-saver';
import { json2csv } from 'json-2-csv';
import { Download, LineChart, Settings } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import router from 'next/router';

export default function WorkspaceLinksClient() {
  const { AddEditLinkModal, AddEditLinkButton } = useAddEditLinkModal();
  const { messages, locale } = useIntlClientHook();
  const { links, isValidating } = useLinks();
  const params = useParams() as { slug: string };
  const { slug } = params;
  const router = useRouter();

  const convertToCSV = async (data: object[]) => {
    const headers = [
      'id',
      'domain',
      'key',
      'url',
      'archived',
      'expiresAt',
      'expiredUrl',
      'passwordEnabledAt',
      'externalId',
      'banned',
      'trackConversion',
      'proxy',
      'title',
      'description',
      'image',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ios',
      'android',
      'geo.AL',
      'userId',
      'projectId',
      'publicStats',
      'clicks',
      'lastClicked',
      'createdAt',
      'updatedAt',
      'comments',
      'user.id',
      'user.name',
      'user.email',
      'user.emailVerified',
      'user.image',
      'user.agencyCode',
      'user.role',
      'user.createdAt',
      'user.subscribed',
      'tags',
      'shortLink',
      'tagId',
      'qrCode',
      'workspaceId',
    ];

    return json2csv(data, {
      keys: headers,
      parseValue(fieldValue, defaultParser) {
        if (fieldValue === null) {
          return '';
        }
        if (fieldValue instanceof Date) {
          return fieldValue.toISOString();
        }
        return defaultParser(fieldValue);
      },
    });
  };

  const getShortDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const exportToCSV = async () => {
    try {
      const csv = links ? await convertToCSV(links) : '';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const shortDate = getShortDate();
      saveAs(blob, `${shortDate}_links.csv`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    }
  };

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const existingModalBackdrop = document.getElementById('modal-backdrop');

      if (
        !e.metaKey &&
        !e.ctrlKey &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !existingModalBackdrop &&
        !isValidating
      ) {
        const key = e.key.toLowerCase();

        switch (key) {
          case 'e':
            e.preventDefault();
            exportToCSV();
            break;
          case 'a':
            e.preventDefault();
            router.push(`/${locale}/${slug}/analytics`);
            break;
          case 's':
            e.preventDefault();
            router.push(`/${locale}/${slug}/settings`);
            break;
        }
      }
    },
    [isValidating, locale, slug, router]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <>
      <AddEditLinkModal />
      <div className="bg-white w-full border-b border-gray-200">
        <MaxWidthWrapper className={cn('flex flex-col  bg-white py-6 max-w-7xl')}>
          <div className="flex flex-row items-center justify-between xs:px-4 sm:px-4 md:px-2 lg:px-0">
            <PageTitle text={messages?.dashboard?.Link_Short} />
            <div className="flex items-center gap-3 ">
              <div
                className="flex items-center space-x-2 z-10 font-poppins"
                onClick={(e) => e.preventDefault()}
              >
                <AddEditLinkButton />
                <LinkButton
                  icon={<LineChart className="h-4 w-4" />}
                  variant="secondary-outline"
                  shortcut="A"
                  href={`/${locale}/${slug}/analytics`}
                  text={messages?.dashboard?.analytics}
                  className="hidden sm:flex"
                />
                <LinkButton
                  icon={<LineChart className="h-4 w-4" />}
                  variant="secondary-outline"
                  href={`/${locale}/${slug}/analytics`}
                  className="sm:hidden flex"
                />

                <Button
                  icon={<Download className="h-4 w-4" />}
                  variant="secondary"
                  shortcut="E"
                  onClick={exportToCSV}
                />
                <LinkButton
                  icon={<Settings className="h-4 w-4" />}
                  variant="secondary"
                  shortcut="S"
                  href={`/${locale}/${slug}/settings`}
                />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper className="max-w-7xl">
        <div className="my-4 grid grid-cols-1 gap-5 xs:px-4 sm:px-4 md:px-2 lg:px-0">
          <LinksContainer AddEditLinkButton={AddEditLinkButton} />
        </div>
      </MaxWidthWrapper>
    </>
  );
}
