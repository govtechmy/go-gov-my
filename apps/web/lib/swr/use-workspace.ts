import { WorkspaceProps } from '@/lib/types';
import { PRO_PLAN, fetcher, getNextPlan } from '@dub/utils';
import { useSession } from 'next-auth/react';
import { useParams, useSearchParams } from 'next/navigation';
import useSWR from 'swr';

export default function useWorkspace() {
  const { data: session } = useSession();
  let { slug } = useParams() as { slug: string | null };
  const searchParams = useSearchParams();
  if (!slug) {
    slug = searchParams.get('slug');
  }

  const {
    data: workspace,
    error,
    mutate,
  } = useSWR<WorkspaceProps>(slug && `/api/workspaces/${slug}`, fetcher, {
    dedupingInterval: 30000,
  });

  return {
    ...workspace,
    nextPlan: workspace?.plan ? getNextPlan(workspace.plan) : PRO_PLAN,
    isOwner:
      session?.user.role === 'super_admin' ||
      workspace?.users.at(0)?.role === 'owner',
    exceededClicks: workspace && workspace.usage >= workspace.usageLimit,
    exceededLinks: workspace && workspace.linksUsage >= workspace.linksLimit,
    exceededAI: workspace && workspace.aiUsage >= workspace.aiLimit,
    error,
    mutate,
    loading: slug && !workspace && !error ? true : false,
  };
}
