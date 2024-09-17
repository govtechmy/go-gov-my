import { handleBasicAuth } from "@/middlewares/basic-auth";
import { handleI18nRouting } from "@/middlewares/i18n";
import { NextRequest } from "next/server";

// Middlewares will be ignored in static export mode
export default async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  const authResponse = handleBasicAuth(request);
  return authResponse || response;
}

export const config = {
  matcher: [
    // // Match only internationalized pathnames
    "/(en-GB|ms-MY)/:path*",
    // // Match all pathnames except for those starting with `/api`, `/_next` or `/_vercel` or those containing a dot (e.g. `favicon.ico`)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
