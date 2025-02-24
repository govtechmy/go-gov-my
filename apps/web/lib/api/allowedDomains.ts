import { prisma } from '@/lib/prisma';
import { AllowedDomainsProps } from '@/lib/types';

export async function createAllowedDomains(
  data: AllowedDomainsProps
): Promise<AllowedDomainsProps> {
  await prisma.allowedDomains.create({
    data,
  });
  return data;
}

export async function upsertAllowedDomains(
  data: AllowedDomainsProps
): Promise<AllowedDomainsProps> {
  await prisma.allowedDomains.upsert({
    where: {
      domain: data.domain,
    },
    update: data,
    create: data,
  });
  return data;
}
