"use client";

import { useIntlClientHook } from "@/lib/middleware/utils/useI18nClient";
import { WorkspaceProps } from "@/lib/types";
import PlanBadge from "@/ui/workspaces/plan-badge";
import {
  BlurImage,
  LoadingSpinner,
  MaxWidthWrapper,
  NumberTooltip,
} from "@dub/ui";
import { DICEBEAR_AVATAR_URL, cn, fetcher, nFormatter } from "@dub/utils";
import { BarChart2, Link2, Search, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Page() {
  const session = useSession();
  const { messages } = useIntlClientHook();
  const [searchValue, setSearchValue] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { data: workspaces } = useSWR<
    Omit<WorkspaceProps, "users" | "domains">[]
  >(
    session.status === "authenticated" &&
      `/api/admin/workspaces?${new URLSearchParams({ search: searchValue })}`,
    fetcher,
  );

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (searchValue === "") {
      newSearchParams.delete("search");
    } else {
      newSearchParams.set("search", searchValue);
    }
    router.replace(`${pathname}?${newSearchParams}`);
  }, [searchValue, router, searchParams, pathname]);

  return (
    <>
      <div className="flex h-36 items-center border-b border-gray-200 bg-white">
        <MaxWidthWrapper>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl text-gray-600">
              {messages.dashboard.workspaces}
            </h1>
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper className="flex flex-col space-y-3 py-3">
        <div className="block lg:hidden">
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            onClear={() => setSearchValue("")}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-7">
          <div className="scrollbar-hide sticky top-32 col-span-2 hidden max-h-[calc(100vh-150px)] self-start overflow-auto rounded-lg border border-gray-100 bg-white shadow lg:block">
            <div className="grid w-full rounded-md bg-white px-5 lg:divide-y lg:divide-gray-300">
              <div className="grid gap-3 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="ml-1 mt-2 font-semibold">
                    {messages.dashboard.filter_workspaces}
                  </h3>
                </div>
                <div className="hidden lg:block">
                  <SearchInput
                    value={searchValue}
                    onChange={(val) => setSearchValue(val)}
                    onClear={() => setSearchValue("")}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 auto-rows-min grid-cols-1 lg:col-span-5">
            <ul className="grid min-h-[66.5vh] auto-rows-min gap-3">
              {workspaces &&
                workspaces.map((workspace) => (
                  <WorkspaceCard key={workspace.id} {...workspace} />
                ))}
            </ul>
            {/* <Pagination /> */}
          </div>
        </div>
      </MaxWidthWrapper>
    </>
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
          <Search className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <input
        type="text"
        className="peer w-full rounded-md border border-gray-300 px-10 text-black placeholder:text-gray-400 focus:border-black focus:ring-0 sm:text-sm"
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
          "pointer-events-auto absolute inset-y-0 right-0 flex items-center pr-4",
          !props.value.length && "hidden",
        )}
      >
        <XCircle className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
};

function WorkspaceCard({
  id,
  name,
  slug,
  logo,
  usage,
  plan,
}: Pick<WorkspaceProps, "id" | "name" | "slug" | "logo" | "usage" | "plan">) {
  const { messages, locale } = useIntlClientHook();
  const { data: linkCount } = useSWR<number>(
    `/api/links/count?workspaceId=${id}`,
    fetcher,
  );

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
            {linkCount ? (
              <NumberTooltip value={linkCount} unit="links">
                <h2 className="whitespace-nowrap text-sm">
                  {nFormatter(linkCount)}{" "}
                  {linkCount != 1
                    ? messages.workspace.links
                    : messages.workspace.link}
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
                {nFormatter(usage)}{" "}
                {usage != 1
                  ? messages.workspace.clicks
                  : messages.workspace.click}
              </h2>
            </NumberTooltip>
          </div>
        </div>
      </Link>
    </div>
  );
}
