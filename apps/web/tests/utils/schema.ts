import { SHORT_DOMAIN } from '@dub/utils';
import { Link, Project, Tag } from '@prisma/client';
import { expect } from 'vitest';

export const expectedLink: Partial<Link> & { tagId: string | null } = {
  id: expect.any(String),
  key: expect.any(String),
  domain: SHORT_DOMAIN,
  trackConversion: false,
  archived: false,
  banned: false,
  expiresAt: null,
  passwordEnabledAt: null,
  proxy: false,
  title: null,
  description: null,
  image: null,
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  ios: null,
  android: null,
  geo: null,
  publicStats: false,
  clicks: 0,
  lastClicked: null,
  tagId: null, // backwards compatibility
  comments: null,
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
  expiredUrl: null,
  externalId: null,
};

export const expectedTag: Partial<Tag> = {
  id: expect.any(String),
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

export const expectedWorkspace: Partial<Project> = {
  id: expect.any(String),
  name: expect.any(String),
  slug: expect.any(String),
  logo: expect.any(String),
  usage: expect.any(Number),
  usageLimit: expect.any(Number),
  linksUsage: expect.any(Number),
  linksLimit: expect.any(Number),
  tagsLimit: expect.any(Number),
  plan: expect.any(String),
  billingCycleStart: expect.any(Number),
  inviteCode: expect.any(String),
  createdAt: expect.any(String),
};
