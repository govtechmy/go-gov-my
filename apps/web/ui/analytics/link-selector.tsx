import { InputSelect, useRouterStuff } from '@dub/ui';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { DUB_LOGO, GOOGLE_FAVICON_URL, getApexDomain } from '@dub/utils';
import { LinkIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo } from 'react';
import { ModalContext } from '../modals/provider';
import useSWR from 'swr';
import { AnalyticsContext } from '.';
import { fetcher } from '@dub/utils';

export default function LinkSelector() {
  const { queryParams } = useRouterStuff();
  const { workspaceId } = useContext(AnalyticsContext);

  const { messages } = useIntlClientHook();
  const message = messages?.analytics;

  const {
    data: links,
    isValidating: isFetchingLinks,
    isLoading,
  } = useSWR<any>(`/api/links?workspaceId=${workspaceId}`, fetcher);

  const searchParams = useSearchParams();
  const selectedLink = useMemo(() => {
    if (links && links.length > 0) {
      const link = searchParams.get('link');
      return links.find(({ key }) => key === link);
    }
  }, [searchParams, links]);
  const { setShowAddEditLinkModal } = useContext(ModalContext);

  function cleanUrl(url: string): string {
    if (!url) return '';
    return url.replace(/^https?:\/\/(www\.)?/, '');
  }

  return links ? (
    <InputSelect
      adjustForMobile
      items={links
        .sort((a, b) => (a.primary ? -1 : b.primary ? 1 : 0))
        .map(({ id, key, url }) => ({
          id,
          value: cleanUrl(url),
          key: key,
          image: `${GOOGLE_FAVICON_URL}${key}`,
        }))}
      icon={<LinkIcon className="h-4 w-4 text-black" />}
      selectedItem={{
        id: selectedLink?.id || '',
        label: selectedLink?.url || '',
        value: cleanUrl(selectedLink?.url) || '',
        image: selectedLink
          ? selectedLink.url
            ? `${GOOGLE_FAVICON_URL}${getApexDomain(selectedLink.url)}`
            : DUB_LOGO
          : undefined,
      }}
      setSelectedItem={(link) => {
        if (link && typeof link !== 'function' && 'key' in link && typeof link.key === 'string') {
          queryParams({
            set: { link: link.key },
          });
        } else {
          queryParams({ del: 'link' });
        }
      }}
      inputAttrs={{
        placeholder: message?.filter_links,
      }}
      className="w-full"
      containerClassName="w-full"
      noItemsElement={
        <div>
          <h4 className="mb-2 px-2 py-2 text-sm text-gray-600">{message?.no_links}</h4>
          <button
            type="button"
            className="w-full rounded-md border border-black bg-black px-3 py-1.5 text-center text-sm text-white transition-all hover:bg-white hover:text-black"
            onClick={() => setShowAddEditLinkModal(true)}
          >
            {message?.add_link}
          </button>
        </div>
      }
    />
  ) : (
    <div className="h-10.5 flex w-full animate-pulse items-center space-x-2 rounded-md bg-gray-200 opacity-50 md:w-48" />
  );
}
