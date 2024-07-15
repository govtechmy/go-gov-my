import { parse } from "@/lib/middleware/utils";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { Session } from "../auth";
import { isInternalAdmin } from "../auth/is-internal-admin";

export default async function AdminMiddleware(req: NextRequest) {
  const { pathWithoutLocale, locale } = parse(req);

  const session = (await getToken({ req })) as unknown as Session;

  const isAdmin = session ? isInternalAdmin(session) : false;

  if (pathWithoutLocale === "/login" && isAdmin) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  } else if (pathWithoutLocale !== "/login" && !isAdmin) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  return NextResponse.rewrite(
    new URL(
      `/${locale}/admin.dub.co${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`,
      req.url,
    ),
  );
}
