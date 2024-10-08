import { prisma } from '@/lib/prisma';
import 'dotenv-flow/config';

async function main() {
  const workspaces = await prisma.project.findMany({
    select: {
      slug: true,
      plan: true,
      usage: true,
    },
    orderBy: {
      usage: 'desc',
    },
    take: 100,
  });
  console.table(workspaces, ['slug', 'plan', 'usage', '_count']);
}

main();
