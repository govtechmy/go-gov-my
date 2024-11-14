'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import useLinks from '@/lib/swr/use-links';
import NavTabs from '@/ui/layout/nav-tabs';
import { SearchBox } from '@/ui/links/link-filters';

import LinksContainer from '@/ui/links/links-container';
import { useAddEditLinkModal } from '@/ui/modals/add-edit-link-modal';
import WorkspaceListSearchInput from '@/ui/workspaces/workspace-list-search-input';
import { MaxWidthWrapper } from '@dub/ui';
import { Button } from '@dub/ui/src/button';
import { saveAs } from 'file-saver';
import { json2csv } from 'json-2-csv';
import { Download } from 'lucide-react';
import { useCallback, useEffect, useRef } from 'react';

export default function WorkspaceLinksClient() {
  const { AddEditLinkModal, AddEditLinkButton } = useAddEditLinkModal();
  const { messages } = useIntlClientHook();
  const { links, isValidating } = useLinks();
  const searchInputRef = useRef();

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
      <div className="flex flex-col border-b border-gray-200 bg-white py-6 xs:px-4">
        <MaxWidthWrapper>
          <div className="flex items-center justify-between">
            <h1 className="truncate text-2xl font-semibold hidden xs:block font-poppins">
              {messages?.dashboard?.Links}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="whitespace-nowrap font-poppins">
                <AddEditLinkButton />
              </div>
              <Button
                icon={<Download className="h-4 w-4" />}
                variant="secondary"
                shortcut="E"
                onClick={exportToCSV}
              />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper>
        {/* <div className="w-full flex justify-center container">
          <NavTabs />
        </div> */}
        <LinksContainer AddEditLinkButton={AddEditLinkButton} />
      </MaxWidthWrapper>
    </>
  );
}
