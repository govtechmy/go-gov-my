import { qstash, receiver } from "@/lib/cron";
import { prisma } from "@/lib/prisma";
import z from "@/lib/zod";
import { APP_DOMAIN_WITH_NGROK, log } from "@dub/utils";
import { trace } from "@opentelemetry/api";
import { NextResponse } from "next/server";
import { domainTransferredEmail, updateLinksInRedis } from "./utils";

const schema = z.object({
  currentWorkspaceId: z.string(),
  newWorkspaceId: z.string(),
  domain: z.string(),
  linksCount: z.number(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordLinks");

  if (process.env.VERCEL === "1") {
    const isValid = await receiver.verify({
      signature: req.headers.get("Upstash-Signature") || "",
      body: JSON.stringify(body),
    });

    if (!isValid) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const { currentWorkspaceId, newWorkspaceId, domain, linksCount } =
    schema.parse(body);

  const links = await prisma.link.findMany({
    where: { domain, projectId: currentWorkspaceId },
    take: 100,
  });

  // No remaining links to transfer
  if (!links || links.length === 0) {
    domainTransferredEmail({
      domain,
      currentWorkspaceId,
      newWorkspaceId,
      linksCount,
    });

    return NextResponse.json({
      response: "success",
    });
  }

  // Transfer links to the new workspace
  const linkIds = links.map((link) => link.id);

  try {
    await Promise.all([
      prisma.link.updateMany({
        where: { domain, projectId: currentWorkspaceId, id: { in: linkIds } },
        data: { projectId: newWorkspaceId },
      }),
      prisma.linkTag.deleteMany({
        where: { linkId: { in: linkIds } },
      }),
      updateLinksInRedis({ links, newWorkspaceId, domain }),
    ]);

    // Log results to OpenTelemetry
    links.forEach((link) => {
      span.addEvent("recordLinks", {
        link_id: link.id,
        domain: link.domain,
        key: link.key,
        url: link.url,
        workspace_id: newWorkspaceId,
        created_at: link.createdAt.toISOString(),
        logtime: new Date().toISOString(),
      });
    });

    // wait 500 ms before making another request
    await new Promise((resolve) => setTimeout(resolve, 500));

    const remainingLinksCount = await prisma.link.count({
      where: { domain, projectId: currentWorkspaceId },
    });

    // No more links to transfer
    if (remainingLinksCount === 0) {
      domainTransferredEmail({
        domain,
        currentWorkspaceId,
        newWorkspaceId,
        linksCount,
      });
    }

    if (remainingLinksCount > 0) {
      await qstash.publishJSON({
        url: `${APP_DOMAIN_WITH_NGROK}/api/cron/domains/transfer`,
        body: {
          currentWorkspaceId,
          newWorkspaceId,
          domain,
        },
      });
    }

    return NextResponse.json({
      response: "success",
    });
  } catch (error) {
    span.recordException(error);
    await log({
      message: `Domain transfer cron for the workspace ${newWorkspaceId} failed. Error: ${error.message}`,
      type: "errors",
    });

    return NextResponse.json({ error: error.message });
  } finally {
    span.end();
  }
}
