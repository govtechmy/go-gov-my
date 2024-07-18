import { parse } from "@/lib/middleware/utils";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { UserProps } from "../types";

export default async function AppMiddleware(req: NextRequest) {
  const { path, fullPath, locale, pathWithoutLocale, fullPathWithoutLocale } =
    parse(req);

  const session = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as {
    email?: string;
    user?: UserProps;
  };

  // Farhan 18 Jul 24
  // This is for temporary to view the static page, need to remove this once deploy
  if (
    pathWithoutLocale === "/home" ||
    pathWithoutLocale === "/notfound" ||
    pathWithoutLocale === "/server_error"
  ) {
    return NextResponse.next();
  }

  // if there's no session and the path isn't /login or /register, redirect to /login
  if (
    !session?.email &&
    pathWithoutLocale !== "/login" &&
    pathWithoutLocale !== "/register"
  ) {
    const response = NextResponse.redirect(
      new URL(
        `/${locale}/login${pathWithoutLocale === "/" ? "" : `?next=${encodeURIComponent(fullPathWithoutLocale)}`}`,
        req.url,
      ),
    );
    response.headers.set("NEXT_LOCALE", locale);
    return response;

    // if there's a session
  } else if (session?.email) {
    // if the user was created in the last 10s
    // (this is a workaround because the `isNewUser` flag is triggered when a user does `dangerousEmailAccountLinking`)
    if (
      session?.user?.createdAt &&
      new Date(session?.user?.createdAt).getTime() > Date.now() - 10000 &&
      // here we include the root page + /new (since they're going through welcome flow already)
      (pathWithoutLocale === "/" || pathWithoutLocale === "/new")
    ) {
      const response = NextResponse.redirect(
        new URL(`/${locale}/welcome`, req.url),
      );
      response.headers.set("NEXT_LOCALE", locale);
      return response;

      // if the path is /login or /register, redirect to "/"
    } else if (
      pathWithoutLocale === "/login" ||
      pathWithoutLocale === "/register"
    ) {
      const response = NextResponse.redirect(new URL(`/${locale}`, req.url));
      response.headers.set("NEXT_LOCALE", locale);
      return response;
    }
  }

  // otherwise, rewrite the path to /app
  const headers = new Headers(req.headers);
  headers.set("NEXT_LOCALE", locale);
  return NextResponse.rewrite(
    new URL(
      `/${locale}/app.dub.co${fullPathWithoutLocale === "/" ? "" : fullPathWithoutLocale}`,
      req.url,
    ),
    { request: { headers: headers } },
  );
}
