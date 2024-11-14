'use client';

import { WorkspaceProps } from '@/lib/types';
import { useWorkspaceListContext } from './workspace-list-context';
import WorkspaceCard from './workspace-card';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import WorkspaceSort from './workspace-sort';

export default function WorkspaceList() {
  const { workspaces } = useWorkspaceListContext();
  const searchParams = useSearchParams();
  const sort = searchParams?.get('sort') || 'name'; // default sort by name

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
      <div className="flex justify-end pb-2">
        <WorkspaceSort />
      </div>
      {sortedWorkspaces.map((workspace) => (
        <WorkspaceCard key={workspace.id} {...workspace} />
      ))}
    </div>
  );
}
