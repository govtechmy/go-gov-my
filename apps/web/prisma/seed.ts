import { upsertAgency } from "@/lib/api/agencies";
import { AgencySchema } from "@/lib/zod/schemas/agencies";

async function seed() {
  const { default: agencies } = await import("./agencies.json");

  for (const agency of agencies) {
    const data = await AgencySchema.parseAsync(agency);
    await upsertAgency(data);
  }
}

seed();
