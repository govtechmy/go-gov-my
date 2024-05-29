import { bulkCreateLinks } from "@/lib/api/links";
import { prisma } from "@/lib/prisma";
import { ProcessedLinkProps } from "@/lib/types";
import { upstashRedis } from "@/lib/upstash";
import "dotenv-flow/config";

const domain = "xxx";

async function main() {
  const restoredData = await upstashRedis.lrange<ProcessedLinkProps>(
    "restoredData",
    0,
    -1,
  );

  if (restoredData.length === 0) {
    const links = await prisma.link.findMany({
      where: {
        domain,
      },
    });
    await upstashRedis.lpush("restoredData", links);
  } else {
    const response = await bulkCreateLinks({ links: restoredData });
    console.log(response);
    // delete restoredData from upstashRedis
    await upstashRedis.del("restoredData");
  }
}

main();
