import { prisma } from "@/lib/prisma";
import { AgencyProps } from "@/lib/types";

export async function createAgency(data: AgencyProps): Promise<AgencyProps> {
  await prisma.agency.create({
    data,
  });
  return data;
}

export async function upsertAgency(data: AgencyProps): Promise<AgencyProps> {
  await prisma.agency.upsert({
    where: {
      code: data.code,
    },
    update: data,
    create: data,
  });
  return data;
}
