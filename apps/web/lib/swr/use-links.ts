import { useRouterStuff } from '@dub/ui';
import { fetcher } from '@dub/utils';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { LinkWithTagsProps, UserProps } from '../types';
import useWorkspace from './use-workspace';

export default function useLinks() {
  const { id } = useWorkspace();
  const { getQueryString } = useRouterStuff();
  const { data: session } = useSession();

  const admin = session?.user.role === 'super_admin';

  const { data: links, isValidating } = useSWR<
    (LinkWithTagsProps & {
      user: UserProps;
    })[]
  >(
    id
      ? `/api/links${getQueryString(
          { workspaceId: id, includeUser: 'true' },
          {
            ignore: ['import', 'upgrade', 'newLink'],
          },
        )}`
      : admin
        ? `/api/admin/links${getQueryString()}`
        : null,
    fetcher,
    {
      dedupingInterval: 20000,
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return {
    links,
    isValidating,
  };
}
