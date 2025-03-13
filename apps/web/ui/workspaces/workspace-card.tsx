'use client';

import { useIntlClientHook } from '@/lib/middleware/utils/useI18nClient';
import { LinkProps, WorkspaceProps } from '@/lib/types';
import { BlurImage, CopyButton, CustomSelect, NumberTooltip } from '@dub/ui';
import { cn, DICEBEAR_AVATAR_URL, fetcher, linkConstructor, nFormatter } from '@dub/utils';
import { BarChart2, Link2, Users, Settings, LineChart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import useSWR from 'swr';
import LinkPagination from '../links/link-pagination';
import LinkCard from '../links/link-card';
import NoLinksPlaceholder from '../links/no-links-placeholder';
import LinkCardPlaceholder from '../links/link-card-placeholder';
import WorkspaceSort from './workspace-sort';
import { LinkButton } from '@dub/ui/src/link-button';

type linkTypes = {
  domain: string;
  key: string;
  clicks: number;
};

export default function WorkspaceCard({
  id,
  name,
  slug,
  logo,
  usage,
  linksUsage,
  plan,
}: WorkspaceProps) {
  const { data: links } = useSWR<linkTypes[]>(`/api/workspaces/lists?workspaceId=${id}`, fetcher);

  const { messages, locale } = useIntlClientHook();
  const { data: session } = useSession();
  const workspace_msg = messages?.workspace;
  const shortDomain = process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN;

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
                role === 'owner' ? setWorkspaceOwnership('pemilik') : setWorkspaceOwnership('ahli');
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
    <>
      <div className="group relative">
        <Link
          key={slug}
          href={`/${locale}/${slug}`}
          className="relative flex flex-col space-y-2 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md font-poppins"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BlurImage
                src={logo || `${DICEBEAR_AVATAR_URL}`}
                alt={id}
                className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full"
                width={32}
                height={32}
              />
              <div className="flex flex-col">
                <h2 className="text-base font-medium text-gray-700">{name}</h2>
                <p className="text-sm text-gray-500 xs:hidden sm:block">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/${locale}/${slug}`
                    : `https://${shortDomain}/${locale}/${slug}`}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 z-10" onClick={(e) => e.preventDefault()}>
              <LinkButton
                icon={<LineChart className="h-4 w-4" />}
                variant="secondary-outline"
                href={`/${locale}/${slug}/analytics`}
              />
              <LinkButton
                icon={<Settings className="h-4 w-4" />}
                variant="secondary"
                href={`/${locale}/${slug}/settings`}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Link2 className="h-4 w-4" />
              <NumberTooltip value={linksUsage || 0}>
                <span>
                  {nFormatter(linksUsage || 0)} {messages?.dashboard?.Link_Short}
                </span>
              </NumberTooltip>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart2 className="h-4 w-4" />
              <NumberTooltip
                value={links ? links.reduce((acc, curr) => acc + curr.clicks, 0) : usage}
              >
                <span>
                  {nFormatter(links ? links.reduce((acc, curr) => acc + curr.clicks, 0) : usage)}{' '}
                  {messages?.dashboard?.Clicks}
                </span>
              </NumberTooltip>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
