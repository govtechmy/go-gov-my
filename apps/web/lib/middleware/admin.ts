import { parse } from "@/lib/middleware/utils";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function AdminMiddleware(req: NextRequest) {
  const { pathWithoutLocale, locale } = parse(req);

  const session = await getToken({ req });
  // TODO: Determine if user is an admin
  let isAdmin = !!session;

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
