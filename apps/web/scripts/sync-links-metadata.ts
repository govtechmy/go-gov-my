import { prisma } from "@/lib/prisma";
import { trace } from "@opentelemetry/api";
import "dotenv-flow/config";

const count = 16;
const limit = 20000;

async function main() {
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordLinks");
  const links = await prisma.link.findMany({
    include: {
      tags: true,
    },
    orderBy: [
      {
        clicks: "desc",
      },
      {
        createdAt: "asc",
      },
    ],
    skip: 10000 + limit * count,
    take: limit,
  });

  //   const links = await prisma.domain
  //     .findMany({
  //       orderBy: [
  //         {
  //           clicks: "desc",
  //         },
  //         {
  //           createdAt: "asc",
  //         },
  //       ],
  //       take: 5000,
  //     })
  //     .then((domains) => {
  //       return domains.map((domain) => ({
  //         id: domain.id,
  //         domain: domain.slug,
  //         key: "_root",
  //         url: domain.target || "",
  //         tags: [] as { tagId: string }[],
  //         projectId: domain.projectId,
  //         createdAt: domain.createdAt,
  //       }));
  //     });

  // Log results to OpenTelemetry
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
    throw error;
  } finally {
    span.end();
  }
}

main();
