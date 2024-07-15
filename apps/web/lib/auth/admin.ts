import { getSearchParams } from "@dub/utils";
import { isInternalAdmin } from "./is-internal-admin";
import { getSession } from "./utils";

// Internal use only (for admin portal)
interface WithAdminHandler {
  ({
    req,
    params,
    searchParams,
  }: {
    req: Request;
    params: Record<string, string>;
    searchParams: Record<string, string>;
  }): Promise<Response>;
}

export const withAdmin =
  (handler: WithAdminHandler) =>
  async (
    req: Request,
    { params = {} }: { params: Record<string, string> | undefined },
  ) => {
    const session = await getSession();
    if (!session?.user) {
      return new Response("Unauthorized: Login required.", { status: 401 });
    }

    let isAdmin = !!isInternalAdmin(session);
    if (!isAdmin) {
      return new Response("Unauthorized: Not an admin.", { status: 401 });
    }

    const searchParams = getSearchParams(req.url);
    return handler({ req, params, searchParams });
  };
