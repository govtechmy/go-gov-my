import { prisma } from "@/lib/prisma";
import { PRO_PLAN } from "@dub/utils";

const WORKSPACE_ID = "ws_abcdefg";
const PLAN = PRO_PLAN;

async function main() {
  await prisma.project.update({
    where: {
      id: WORKSPACE_ID.replace("ws_", ""),
    },
    data: {
      stripeId: null,
      billingCycleStart: new Date().getDate(),
      plan: PLAN.name.toLowerCase(),
      usageLimit: PLAN.limits.clicks!,
      linksLimit: PLAN.limits.links!,
      domainsLimit: PLAN.limits.domains!,
      aiLimit: PLAN.limits.ai!,
      tagsLimit: PLAN.limits.tags!,
      usersLimit: PLAN.limits.users!,
    },
  });

  console.log(
    `Worskpace with ID ${WORKSPACE_ID} has been upgraded to the ${PLAN.name} plan!`,
  );
}

main();
