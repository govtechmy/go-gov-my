import { prisma } from "@/lib/prisma";
import { trace } from "@opentelemetry/api";
import "dotenv-flow/config";

async function main() {
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordLinks");
  const links = await prisma.link.findMany({
    where: {
      tags: {
        some: {},
      },
    },
    include: {
      tags: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    skip: 0,
    take: 1000,
  });

  try {
    var res = links.forEach((link) => {
      span.addEvent("recordLinks", {
        link_id: link.id,
        domain: link.domain,
        key: link.key,
        url: link.url,
        tag_ids: link.tags.map((tag) => tag.tagId),
        workspace_id: link.projectId?.toString(),
        created_at: link.createdAt.toISOString(),
        logtime: new Date().toISOString(),
      });
    });
    console.log(res);
  } catch (error) {
    span.recordException(error);
  } finally {
    span.end();
  }
}

main();
