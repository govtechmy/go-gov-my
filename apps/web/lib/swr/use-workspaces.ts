import { WorkspaceProps } from "@/lib/types";
import { fetcher } from "@dub/utils";
import useSWR from "swr";

export default function useWorkspaces(options?: { search?: string }) {
  const searchParams = new URLSearchParams();
  if (options?.search) {
    searchParams.set("search", options.search);
  }

  const {
    data: workspaces,
    error,
    isLoading,
    isValidating,
  } = useSWR<WorkspaceProps[]>(`/api/workspaces?${searchParams}`, fetcher, {
    dedupingInterval: 30000,
  });

  return {
    workspaces,
    error,
    loading: isLoading,
    validating: isValidating,
  };
}
