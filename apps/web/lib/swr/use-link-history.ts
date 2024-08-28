import type { LinkHistory } from "@/lib/api/links/add-to-history";
import { fetcher } from "@dub/utils";
import useSWR from "swr";

type Options =
  | {
      linkId: string;
      enabled: boolean;
      admin: false;
      workspaceId: string;
    }
  | {
      linkId: string;
      enabled: boolean;
      admin: true;
    };

export default function useLinkHistory(opts: Options) {
  let apiURL: string = "";
  if (opts.admin) {
    apiURL = `/api/admin/links/${opts.linkId}/history`;
  } else {
    apiURL = `/api/links/${opts.linkId}/history?workspaceId=${opts.workspaceId}`;
  }

  return useSWR<LinkHistory[]>(
    opts.enabled && apiURL,
    async (input: RequestInfo, init?: RequestInit) => {
      const history = await fetcher<LinkHistory[]>(input, init);
      history.forEach((h) => {
        // Convert the string timestamps to Date instance
        h.timestamp = new Date(h.timestamp);
        if (h.expiresAt) h.expiresAt = new Date(h.expiresAt);
      });
      return history;
    },
  );
}
