import z from '@/lib/zod';
import { metaTagsSchema } from '@/lib/zod/schemas/metatags';
import { Link } from '@prisma/client';
import { AgencySchema } from './zod/schemas/agencies';
import { createLinkBodySchema } from './zod/schemas/links';
import { AllowedDomainsSchema } from './zod/schemas/allowedDomains';

export type LinkProps = Link;

export interface LinkWithTagsProps extends LinkProps {
  tags: TagProps[];
}

export interface SimpleLinkProps {
  domain: string;
  key: string;
  url: string;
}

export interface QRLinkProps {
  domain: string;
  key: string;
  url?: string;
}

export interface RedisLinkProps {
  id: string;
  url: string;
  password?: boolean;
  proxy?: boolean;
  expiresAt?: Date;
  expiredUrl?: string;
  ios?: string;
  android?: string;
  geo?: object;
  projectId?: string;
}

export interface EdgeLinkProps {
  id: string;
  domain: string;
  key: string;
  url: string;
  proxy: boolean;
  title: string;
  description: string;
  image: string;
  password: string;
  clicks: number;
  publicStats: boolean;
  userId: string;
  projectId: string;
}

export interface TagProps {
  id: string;
  name: string;
  color: TagColorProps;
}

export type TagColorProps = (typeof tagColors)[number];

export type PlanProps = (typeof plans)[number];

export type OwnershipProps = (typeof ownership)[number];

export type RoleProps = (typeof roles)[number];

export interface WorkspaceProps {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  usage: number;
  usageLimit: number;
  aiUsage: number;
  aiLimit: number;
  linksUsage: number;
  linksLimit: number;
  tagsLimit: number;
  plan: PlanProps;
  billingCycleStart: number;
  createdAt: Date;
  users: {
    role: RoleProps;
  }[];
  inviteCode: string;
}

export interface UserProps {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  migratedWorkspace: string | null;
}

export interface WorkspaceUserProps extends UserProps {
  role: RoleProps;
}

export type NewLinkProps = z.infer<typeof createLinkBodySchema>;

type ProcessedLinkOverrides = 'domain' | 'key' | 'url' | 'projectId';
export type ProcessedLinkProps = Omit<NewLinkProps, ProcessedLinkOverrides> &
  Pick<LinkProps, ProcessedLinkOverrides> & { userId?: LinkProps['userId'] };

export const plans = [
  'free',
  'pro',
  'business',
  'business plus',
  'business extra',
  'business max',
  'enterprise',
] as const;

export const ownership = ['owner', 'member', 'ahli', 'pemilik'] as const;

export const roles = ['owner', 'member'] as const;

export const tagColors = ['red', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown'] as const;

export type MetaTag = z.infer<typeof metaTagsSchema>;

export type AgencyProps = z.infer<typeof AgencySchema>;

export type AllowedDomainsProps = z.infer<typeof AllowedDomainsSchema>;
