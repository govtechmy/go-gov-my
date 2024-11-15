'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LoadingSpinner } from '@dub/ui';
import { cn } from '@dub/utils';
import { Search, XCircle } from 'lucide-react';
import { useWorkspaceListContext } from './workspace-list-context';

export default function WorkspaceListSearchInput() {
  const { searchValue, setSearchValue, validating } = useWorkspaceListContext();

  return (
    <SearchInput
      value={searchValue}
      onChange={setSearchValue}
      onClear={() => setSearchValue('')}
      isLoading={validating}
    />
  );
}

export const SearchInput = (props: {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  isLoading?: boolean;
}) => {
  const { messages } = useIntlClientHook();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        {props.isLoading ? (
          <LoadingSpinner className="h-4 w-4" />
        ) : (
          <>
            <Search className="h-4 w-4 text-gray-400" />
          </>
        )}
      </div>
      <input
        type="text"
        className="peer w-full rounded-full border border-gray-300 px-10 text-black placeholder:text-gray-400 transition-all duration-300 focus:border-blue-300 focus:ring-2 focus:ring-blue-300 sm:text-sm font-poppins"
        placeholder={messages.dashboard.search}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
      <button
        onClick={() => {
          props.onClear();
        }}
        className={cn(
          'pointer-events-auto absolute inset-y-0 right-0 flex items-center pr-4',
          !props.value.length && 'hidden'
        )}
      >
        <XCircle className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
};
