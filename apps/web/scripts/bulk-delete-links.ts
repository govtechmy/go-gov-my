import { prisma } from "@/lib/prisma";
import { trace } from "@opentelemetry/api";
import "dotenv-flow/config";

const domain = "song.fyi";

async function main() {
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordLinks");

  const links = await prisma.link.findMany({
    where: {
      domain,
    },
    select: {
      id: true,
      domain: true,
      key: true,
      url: true,
      projectId: true,
      tags: true,
      createdAt: true,
    },
    // take: 10000,
  });

  try {
    const response = await Promise.allSettled([
      prisma.link.deleteMany({
        where: {
          domain,
          id: {
            in: links.map((link) => link.id),
          },
        },
      }),
    ]);

    // Log results to OpenTelemetry
    links.forEach((link) => {
      span.addEvent("recordLinks", {
        link_id: link.id,
        domain: link.domain,
        key: link.key,
        url: link.url,
        tag_ids: link.tags.map((tag) => tag.tagId),
        workspace_id: link.projectId?.toString(),
        created_at: link.createdAt.toISOString(),
        deleted: true,
        logtime: new Date().toISOString(),
      });
    });
  } catch (error) {
    span.recordException(error);
  } finally {
    span.end();
  }
}

main();
