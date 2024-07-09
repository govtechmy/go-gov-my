import { z } from "zod";

export const AgencySchema = z.object({
  code: z.string().min(1),
  logo: z.string().url().nullable(),
  names: z.object({
    en: z.string().min(1),
    ms: z.string().min(1),
  }),
});

export const createAgencySchema = AgencySchema;
