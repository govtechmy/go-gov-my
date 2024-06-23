"use client";

import useUser from "@/lib/swr/use-user";
import { WorkspaceProps } from "@/lib/types";
import { BlurImage, InlineSnippet, NumberTooltip } from "@dub/ui";
import {
  DICEBEAR_AVATAR_URL,
  SHORT_DOMAIN,
  cn,
  fetcher,
  nFormatter,
} from "@dub/utils";
import { BarChart2, Link2 } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import PlanBadge from "./plan-badge";
import WorkspaceArrow from "./workspace-arrow";
import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";

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

  const { user } = useUser();
  const { messages, locale } = useIntlClientHook();
  const workspace_msg = messages?.workspace

  const isMigratedWorkspace = user?.migratedWorkspace === id;

  return (
    <div className="group relative">
      {isMigratedWorkspace && (
        <>
          <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-red-600 to-violet-600 opacity-25 blur-lg transition duration-1000 group-hover:opacity-75 group-hover:duration-200" />
          <WorkspaceArrow className="absolute -bottom-20 right-56 z-10 text-violet-600 lg:right-0" />
          <div className="absolute -bottom-28 right-0 z-10 w-full max-w-[16rem] rounded-lg border border-gray-200 bg-white p-3 text-center text-sm shadow lg:-right-56">
            <p>
              {workspace_msg?.your} <InlineSnippet>{SHORT_DOMAIN}</InlineSnippet>
              {workspace_msg?.migrate}
            </p>
            <a
              href="https://dub.co/changelog/dub-links-updates"
              target="_blank"
              className="mt-1 block text-gray-500 underline underline-offset-4 hover:text-gray-800"
            >
              {workspace_msg?.read}
            </a>
          </div>
        </>
      )}
      <Link
        key={slug}
        href={`/${locale}/${slug}`}
        className={cn(
          "relative flex flex-col justify-between space-y-10 rounded-lg border border-gray-100 bg-white p-6 shadow transition-all hover:shadow-lg",
          {
            "border-violet-600": isMigratedWorkspace,
          },
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <BlurImage
              src={logo || `${DICEBEAR_AVATAR_URL}${name}`}
              alt={id}
              className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full"
              width={48}
              height={48}
            />
            <div>
              <h2 className="max-w-[200px] truncate text-lg font-medium text-gray-700">
                {name}
              </h2>
            </div>
          </div>
          <PlanBadge plan={plan} />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-gray-500">
            <Link2 className="h-4 w-4" />
            {count || count === 0 ? (
              <NumberTooltip value={count} unit="links">
                <h2 className="whitespace-nowrap text-sm">
                  {nFormatter(count)} {count != 1 ? workspace_msg?.links : workspace_msg?.link}
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
                {nFormatter(usage)} {usage != 1 ? workspace_msg?.clicks : workspace_msg?.click}
              </h2>
            </NumberTooltip>
          </div>
        </div>
      </Link>
    </div>
  );
}
