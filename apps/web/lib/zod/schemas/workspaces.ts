import { isReservedKey } from '@/lib/edge-config';
import z from '@/lib/zod';
import { DEFAULT_REDIRECTS, validSlugRegex } from '@dub/utils';
import slugify from '@sindresorhus/slugify';
import { planSchema, roleSchema } from './misc';

export const workspaceIdSchema = z.object({
  workspaceId: z
    .string()
    .min(1, 'Workspace ID is required.')
    .describe('The ID of the workspace the link belongs to.'),
});

export const WorkspaceSchema = z
  .object({
    id: z.string().describe('The unique ID of the workspace.'),
    name: z.string().describe('The name of the workspace.'),
    slug: z.string().describe('The slug of the workspace.'),
    logo: z.string().nullable().default(null).describe('The logo of the workspace.'),
    usage: z.number().describe('The usage of the workspace.'),
    usageLimit: z.number().describe('The usage limit of the workspace.'),
    linksUsage: z.number().describe('The links usage of the workspace.'),
    linksLimit: z.number().describe('The links limit of the workspace.'),
    tagsLimit: z.number().describe('The tags limit of the workspace.'),
    plan: planSchema,
    billingCycleStart: z
      .number()
      .describe('The date and time when the billing cycle starts for the workspace.'),
    createdAt: z.date().describe('The date and time when the workspace was created.'),
    users: z
      .array(
        z.object({
          role: roleSchema,
        })
      )
      .describe('The role of the authenticated user in the workspace.'),
    inviteCode: z.string().nullable().describe('The invite code of the workspace.'),
  })
  .openapi({
    title: 'Workspace',
  });

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(32),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(48, 'Slug must be less than 48 characters')
    .transform((v) => slugify(v))
    .refine((v) => validSlugRegex.test(v), { message: 'Invalid slug format' })
    .refine(async (v) => !((await isReservedKey(v)) || DEFAULT_REDIRECTS[v]), {
      message: 'Cannot use reserved slugs',
    }),
});
