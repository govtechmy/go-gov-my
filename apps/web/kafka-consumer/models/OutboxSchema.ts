import { z } from 'zod';

export const OutboxSchema = z.object({
  id: z.string().min(1),
  host: z.string().min(1),
  payload: z.string().min(1),
  createdAt: z.string().min(1),
  action: z.string().min(1),
  headers: z.string().min(1),
  partitionKey: z.string().min(1),
  encryptedSecrets: z.string().min(1).nullish(),
});
