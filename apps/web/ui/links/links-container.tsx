'use client';

import useLinks from '@/lib/swr/use-links';
import useLinksCount from '@/lib/swr/use-links-count';
import { CustomSelect, IconMenu, MaxWidthWrapper } from '@dub/ui';
import { cn } from '@dub/utils';
import { ChevronDown, Filter, Rows2Icon, Rows3Icon } from 'lucide-react';
import { ReactNode, Suspense, useRef, useState } from 'react';
import { useLinkFiltersModal } from '../modals/link-filters-modal';
import LinkCard from './link-card';
import LinkCardPlaceholder from './link-card-placeholder';
import LinkFilters, { SearchBox } from './link-filters';
import LinkPagination from './link-pagination';
import LinkSort from './link-sort';
import NoLinksPlaceholder from './no-links-placeholder';
import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';

type LinkView = 'cards' | 'compact';

export default function LinksContainer({
  AddEditLinkButton,
}: {
  AddEditLinkButton: () => JSX.Element;
}) {
  const { links, isValidating } = useLinks();
  const { data: count } = useLinksCount();
  const { LinkFiltersButton, LinkFiltersModal } = useLinkFiltersModal();
  const [openPopover, setOpenPopover] = useState(false);
  const searchInputRef = useRef();
  const [linkView, setLinkView] = useState<LinkView>('cards');
  const { messages } = useIntlClientHook();

  const options: { label: string; value: LinkView; full: string }[] = [
    {
      label: messages?.link?.card_view_short || 'Card View',
      value: 'cards',
      full: messages?.link?.card_view_full || 'Card View',
    },
    {
      label: messages?.link?.compact_view_short || 'Compact View',
      value: 'compact',
      full: messages?.link?.compact_view_full || 'Compact View',
    },
  ];

  const viewIcon: Record<LinkView, ReactNode> = {
    cards: <Rows2Icon className="h-4 w-4" />,
    compact: <Rows3Icon className="h-4 w-4" />,
  };

  const compact = linkView === 'compact';

  return (
    <>
      <LinkFiltersModal />
      <MaxWidthWrapper className="flex flex-col space-y-3 font-inter px-2 sm:px-2 xl:px-0">
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col sm:hidden pb-1">
            <LinkFiltersButton />
          </div>
          <div className="hidden sm:block">
            <LinkFiltersButton />
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <div className="flex flex-col sm:w-auto">
              <LinkSort />
            </div>
            <div className="flex flex-col sm:w-auto">
              <CustomSelect
                icon={viewIcon[linkView]}
                options={options}
                onChange={async (e) => setLinkView(e.value as LinkView)}
                defaultValue={0}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-8">
          <div className="scrollbar-hide sticky top-32 col-span-2 hidden max-h-[calc(100vh-150px)] self-start overflow-auto rounded-lg border border-gray-100 bg-white shadow lg:block lg:col-span-2">
            <Suspense>
              <LinkFilters />
            </Suspense>
          </div>
          <div className="col-span-1 auto-rows-min grid-cols-1 lg:col-span-6">
            <ul className={cn('grid min-h-[66.5vh] auto-rows-min gap-3', compact && 'gap-0')}>
              {links && !isValidating ? (
                links.length > 0 ? (
                  links.map((props) => (
                    <Suspense key={props.id} fallback={<LinkCardPlaceholder />}>
                      <LinkCard props={props} compact={compact} />
                    </Suspense>
                  ))
                ) : (
                  <NoLinksPlaceholder AddEditLinkButton={AddEditLinkButton} />
                )
              ) : (
                Array.from({ length: 10 }).map((_, i) => <LinkCardPlaceholder key={i} />)
              )}
            </ul>
            {count && count > 0 ? (
              <Suspense>
                <LinkPagination />
              </Suspense>
            ) : null}
          </div>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
