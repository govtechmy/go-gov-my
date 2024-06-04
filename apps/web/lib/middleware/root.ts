import { API_DOMAIN, DUB_HEADERS } from "@dub/utils";
import { trace } from "@opentelemetry/api";
import type { RootMiddlewareLinkDataResponse } from "app/api/middleware/root/link-data/route";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { parse } from "./utils";

export default async function RootMiddleware(
  req: NextRequest,
  ev: NextFetchEvent,
) {
  const { domain } = parse(req);

  if (!domain) {
    return NextResponse.next();
  }

  // Issue #8: self-host redis (https://github.com/govtechmy/go-gov-my/issues/8)
  // need to make a HTTP request since middlewares use the edge runtime which cannot connect to redis servers
  async function fetchLinkData(
    domain: string,
  ): Promise<RootMiddlewareLinkDataResponse> {
    const url = new URL("/api/middleware/root/link-data", API_DOMAIN);
    url.searchParams.set("domain", domain);
    const response = await fetch(url);
    return response.json();
  }

  const linkData = await fetchLinkData(domain);
  if (!linkData) {
    // rewrite to placeholder page if domain doesn't exist
    return NextResponse.rewrite(new URL(`/${domain}`, req.url), DUB_HEADERS);
  }

  const { id, url, rewrite, iframeable } = linkData;
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordClick");

  // record clicks on root page
  // ev.waitUntil(recordClick({ req, id, ...(url && { url }), root: true }));
  // Log results to OpenTelemetry
  try {
    span.addEvent("recordClick", {
      id,
      url,
      workspace_id: linkData.id?.toString(),
      logtime: new Date().toISOString(),
    });
  } catch (error) {
    span.recordException(error);
  } finally {
    span.end();
  }

  if (!url) {
    // rewrite to placeholder page unless the user defines a site to redirect to
    return NextResponse.rewrite(new URL(`/${domain}`, req.url), DUB_HEADERS);
  }

  if (rewrite) {
    if (iframeable) {
      return NextResponse.rewrite(
        new URL(`/cloaked/${encodeURIComponent(url)}`, req.url),
        DUB_HEADERS,
      );
    } else {
      // if link is not iframeable, use Next.js rewrite instead
      return NextResponse.rewrite(url, DUB_HEADERS);
    }
  } else {
    // For root links that have a destination URL, use 301 status code (for SEO purposes)
    return NextResponse.redirect(url, { ...DUB_HEADERS, status: 301 });
  }
}
