'use client';

import { WorkspaceProps } from '@/lib/types';
import { useWorkspaceListContext } from './workspace-list-context';
import WorkspaceCard from './workspace-card';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import WorkspaceSort from './workspace-sort';
import WorkspaceListSearchInput from './workspace-list-search-input';

export default function WorkspaceList() {
  const { workspaces } = useWorkspaceListContext();
  const searchParams = useSearchParams();
  const sort = searchParams?.get('sort') || 'links';

  const sortedWorkspaces = useMemo(() => {
    if (!workspaces) return [];

    return [...workspaces].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'clicks':
          return (b.usage || 0) - (a.usage || 0);
        case 'links':
          return (b.linksUsage || 0) - (a.linksUsage || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [workspaces, sort]);

  if (!workspaces) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="w-full sm:w-72">
          <WorkspaceListSearchInput />
        </div>
        <WorkspaceSort />
      </div>
      {sortedWorkspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} {...workspace} />
      ))}
    </div>
  );
}
