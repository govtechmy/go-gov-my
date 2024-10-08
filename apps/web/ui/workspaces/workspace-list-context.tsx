'use client';

import useWorkspaces from '@/lib/swr/use-workspaces';
import { WorkspaceProps } from '@/lib/types';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type Context = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  workspaces?: WorkspaceProps[];
  loading: boolean;
  validating: boolean;
  error: unknown;
} | null;

const WorkspaceListContext = createContext<Context>(null);

export const WorkspaceListProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [searchValue, setSearchValue] = useState('');

  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const debounced = useDebouncedCallback(setDebouncedSearchValue, 500);
  useEffect(() => debounced(searchValue), [searchValue, debounced]);

  const { workspaces, loading, error, validating } = useWorkspaces({
    search: debouncedSearchValue,
  });

  return (
    <WorkspaceListContext.Provider
      value={{
        searchValue,
        setSearchValue,
        workspaces,
        loading,
        error,
        validating,
      }}
    >
      {children}
    </WorkspaceListContext.Provider>
  );
};

export const useWorkspaceListContext = () => {
  const context = useContext(WorkspaceListContext);

  if (!context) {
    throw Error(
      'useWorkspaceListContext must be called within a WorkspaceListProvider',
    );
  }

  return context;
};
