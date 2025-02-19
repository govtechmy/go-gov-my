import { z } from 'zod';

export const AllowedDomainsSchema = z.object({
  domain: z.string().trim(),
  isActive: z.boolean(),
});
