'use client';

import { Sort } from '@/ui/shared/icons';
import { MessagesContext } from '@/ui/switcher/provider';
import { IconMenu, Popover, Tick, useRouterStuff } from '@dub/ui';
import { ChevronDown, SortDesc } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';

export default function WorkspaceSort() {
  const [openPopover, setOpenPopover] = useState(false);
  const searchParams = useSearchParams();
  const sort = searchParams?.get('sort');
  const { queryParams } = useRouterStuff();
  const messages = useContext(MessagesContext);

  const sortOptions = [
    {
      display: messages?.workspace?.name || 'Name',
      slug: 'name',
    },
    {
      display: messages?.dashboard?.number_clicks || 'Clicks',
      slug: 'clicks',
    },
    {
      display: messages?.dashboard?.Link_Short || 'Links',
      slug: 'links',
    },
  ];

  const selectedSort = useMemo(() => {
    return sortOptions.find((s) => s.slug === sort) || sortOptions[0];
  }, [sort]);

  return (
    <Popover
      content={
        <div className="w-full p-2 md:w-56 font-poppins">
          {sortOptions.map(({ display, slug }) => (
            <button
              key={slug}
              onClick={() => {
                queryParams({
                  set: {
                    sort: slug,
                  },
                });
                setOpenPopover(false);
              }}
              className="flex w-full items-center justify-between space-x-2 rounded-md px-1 py-2 hover:bg-gray-100 active:bg-gray-200 "
            >
              <IconMenu text={display} icon={<SortDesc className="h-4 w-4" />} />
              {selectedSort.slug === slug && <Tick className="h-4 w-4" aria-hidden="true" />}
            </button>
          ))}
        </div>
      }
      openPopover={openPopover}
      setOpenPopover={setOpenPopover}
    >
      <button
        onClick={() => setOpenPopover(!openPopover)}
        className="flex font-poppins w-56 items-center justify-between space-x-2 rounded-md bg-white px-3 py-2.5 shadow transition-all duration-75 hover:shadow-md"
      >
        <IconMenu
          text={sort ? selectedSort.display : messages?.dashboard?.sort_by}
          icon={sort ? <SortDesc className="h-4 w-4" /> : <Sort className="h-4 w-4 shrink-0" />}
        />
        <ChevronDown
          className={`h-5 w-5 text-gray-400 ${
            openPopover ? 'rotate-180 transform' : ''
          } transition-all duration-75`}
        />
      </button>
    </Popover>
  );
}
