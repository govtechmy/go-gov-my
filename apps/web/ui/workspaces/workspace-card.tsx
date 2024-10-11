'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { WorkspaceProps } from '@/lib/types';
import { BlurImage, NumberTooltip } from '@dub/ui';
import { DICEBEAR_AVATAR_URL, fetcher, nFormatter } from '@dub/utils';
import { BarChart2, Link2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import PlanBadge from './plan-badge';

export default function WorkspaceCard({
  id,
  name,
  slug,
  logo,
  usage,
  plan,
}: WorkspaceProps) {
  const { data: count } = useSWR<number>(
    `/api/links/count?workspaceId=${id}`,
    fetcher,
  );

  const { messages, locale } = useIntlClientHook();
  const { data: session } = useSession();
  const workspace_msg = messages?.workspace;

  const [workspaceOwnership, setWorkspaceOwnership] = useState<
    'member' | 'owner' | 'pemilik' | 'ahli'
  >(locale === 'en-GB' ? 'member' : 'ahli');

  useEffect(() => {
    const fetchOwnership = async () => {
      if (session && session.user && session.user.id) {
        try {
          const response = await fetch(`/api/projectusers?workspaceId=${id}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.projectUsers && data.projectUsers.length > 0) {
              const role = data.projectUsers[0].role; // Assuming you want the role of the first entry
              if (locale === 'ms-MY') {
                role === 'owner'
                  ? setWorkspaceOwnership('pemilik')
                  : setWorkspaceOwnership('ahli');
              } else {
                setWorkspaceOwnership(role);
              }
            } else {
              console.error('Role not found in the response');
            }
          } else {
            console.error('Failed to fetch workspace ownership data');
          }
        } catch (error) {
          console.error('Error fetching workspace ownership data:', error);
        }
      }
    };

    fetchOwnership();
  }, [session, locale]);

  return (
    <div className="group relative">
      <Link
        key={slug}
        href={`/${locale}/${slug}`}
        className="relative flex flex-col justify-between space-y-10 rounded-lg border border-gray-100 bg-white p-6 shadow transition-all hover:shadow-lg"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <BlurImage
              src={logo || `${DICEBEAR_AVATAR_URL}${name}`}
              alt={id}
              className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full object-cover"
              width={48}
              height={48}
            />
            <div>
              <h2 className="max-w-[200px] truncate text-lg font-medium text-gray-700">
                {name}
              </h2>
            </div>
          </div>
          {workspaceOwnership && <PlanBadge plan={workspaceOwnership} />}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500">
            <Link2 className="h-4 w-4" />
            {count || count === 0 ? (
              <NumberTooltip value={count} unit="links">
                <h2 className="whitespace-nowrap text-sm">
                  {nFormatter(count)}{' '}
                  {count != 1 ? workspace_msg?.links : workspace_msg?.link}
                </h2>
              </NumberTooltip>
            ) : (
              <div className="h-4 w-16 animate-pulse rounded-md bg-gray-200" />
            )}
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <BarChart2 className="h-4 w-4" />
            <NumberTooltip value={usage}>
              <h2 className="whitespace-nowrap text-sm">
                {nFormatter(usage)}{' '}
                {usage != 1 ? workspace_msg?.clicks : workspace_msg?.click}
              </h2>
            </NumberTooltip>
          </div>
        </div>
      </Link>
    </div>
  );
}
