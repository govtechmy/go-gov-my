import { upsertAgency } from '@/lib/api/agencies';
import { upsertAllowedDomains } from '@/lib/api/allowedDomains';
import { AgencySchema } from '@/lib/zod/schemas/agencies';
import { AllowedDomainsSchema } from '@/lib/zod/schemas/allowedDomains';

async function seed() {
  const { default: agencies } = await import('./agencies.json');

  for (const agency of agencies) {
    const data = await AgencySchema.parseAsync(agency);
    await upsertAgency(data);
  }

  const { default: domains } = await import('./allowedDomains.json');

  for (const domain of domains) {
    const data = await AllowedDomainsSchema.parseAsync(domain);
    await upsertAllowedDomains(data);
  }
}

seed();
