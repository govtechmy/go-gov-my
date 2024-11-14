'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useLinks from '@/lib/swr/use-links';

import LinksContainer from '@/ui/links/links-container';
import { useAddEditLinkModal } from '@/ui/modals/add-edit-link-modal';
import PageTitle from '@/ui/typography/page-title';
import { MaxWidthWrapper } from '@dub/ui';
import { Button } from '@dub/ui/src/button';
import { cn } from '@dub/utils';
import { saveAs } from 'file-saver';
import { json2csv } from 'json-2-csv';
import { Download } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

export default function WorkspaceLinksClient() {
  const { AddEditLinkModal, AddEditLinkButton } = useAddEditLinkModal();
  const { messages } = useIntlClientHook();
  const { links, isValidating } = useLinks();

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
        e.key.toLowerCase() === 'e' &&
        !e.metaKey &&
        !e.ctrlKey &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        !existingModalBackdrop &&
        !isValidating
      ) {
        e.preventDefault();
        exportToCSV();
      }
    },
    [isValidating]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <>
      <AddEditLinkModal />
      <MaxWidthWrapper className={cn('flex flex-col border-b border-gray-200 bg-white py-6')}>
        <div className="flex flex-row items-center justify-between px-4 md:px-8 lg:px-16 xl:px-32">
          <PageTitle text={messages?.dashboard?.Links} />
          <div className="flex items-center gap-3 ">
            <AddEditLinkButton />
            <Button
              icon={<Download className="h-4 w-4" />}
              variant="secondary"
              shortcut="E"
              onClick={exportToCSV}
            />
          </div>
        </div>
      </MaxWidthWrapper>
      <MaxWidthWrapper>
        <div className="my-4 grid grid-cols-1 gap-5 px-4 md:px-8 lg:px-16 xl:px-32">
          <LinksContainer AddEditLinkButton={AddEditLinkButton} />
        </div>
        {/* <div className="w-full flex justify-center container">
          <NavTabs />
        </div> */}
      </MaxWidthWrapper>
    </>
  );
}
