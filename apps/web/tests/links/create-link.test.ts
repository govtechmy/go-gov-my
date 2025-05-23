import { LinkSchema } from '@/lib/zod/schemas/links';
import { Link, Tag } from '@prisma/client';
import { describe, expect, test } from 'vitest';
import { randomId } from '../utils/helpers';
import { IntegrationHarness } from '../utils/integration';
import { link } from '../utils/resource';
import { expectedLink } from '../utils/schema';

const { domain, url } = link;

describe.sequential('POST /links', async () => {
  const h = new IntegrationHarness();
  const { workspace, user, http } = await h.init();
  const { workspaceId } = workspace;
  const projectId = workspaceId.replace('ws_', '');

  test('default domain', async () => {
    const externalId = randomId();

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        publicStats: true,
        comments: 'This is a test',
        rewrite: true,
        domain,
        externalId,
      },
    });

    expect(status).toEqual(200);
    expect(link).toStrictEqual({
      ...expectedLink,
      url,
      externalId,
      publicStats: true,
      comments: 'This is a test',
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('user defined key', async () => {
    const key = randomId();

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        key,
        domain,
      },
    });

    expect(status).toEqual(200);
    expect(link).toStrictEqual({
      ...expectedLink,
      key,
      url,
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('prefix', async () => {
    const prefix = 'gh';

    const { status, data: link } = await http.post<Link & { shortLink: string }>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        domain,
        prefix,
      },
    });

    expect(status).toEqual(200);
    expect(link.key.startsWith(prefix)).toBeTruthy();
    expect(link).toStrictEqual({
      ...expectedLink,
      domain,
      url,
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('utm builder', async (ctx) => {
    const longUrl = new URL(url);
    const utm = {
      utm_source: 'facebook',
      utm_medium: 'social',
      utm_campaign: 'summer',
      utm_term: 'shoes',
      utm_content: 'cta',
    };

    Object.keys(utm).forEach((key) => {
      longUrl.searchParams.set(key, utm[key]);
    });

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url: longUrl.href,
        domain,
      },
    });

    expect(status).toEqual(200);
    expect(link).toStrictEqual({
      ...expectedLink,
      ...utm,
      url: longUrl.href,
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('password protection', async () => {
    const password = 'link-password';

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        domain,
        password,
      },
    });

    expect(status).toEqual(200);
    expect(link.passwordEnabledAt).toBeTruthy();
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('link expiration', async () => {
    const expiresAt = new Date('2030-04-16T17:00:00.000Z');
    const expiredUrl = 'https://github.com/expired';

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        domain,
        expiresAt,
        expiredUrl,
      },
    });

    expect(status).toEqual(200);
    expect(link).toStrictEqual({
      ...expectedLink,
      url,
      expiresAt: '2030-04-16T17:00:00.000Z',
      expiredUrl,
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('device targeting', async () => {
    const ios = 'https://apps.apple.com/app/1611158928';
    const android = 'https://play.google.com/store/apps/details?id=com.disney.disneyplus';

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        domain,
        ios,
        android,
      },
    });

    expect(status).toEqual(200);
    expect(link).toStrictEqual({
      ...expectedLink,
      url,
      ios,
      android,
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('geo targeting', async () => {
    const geo = {
      AF: `${url}/AF`,
      AL: `${url}/AL`,
      DZ: `${url}/DZ`,
    };

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        domain,
        geo,
      },
    });

    expect(status).toEqual(200);
    expect(link).toStrictEqual({
      ...expectedLink,
      url,
      geo,
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });

  test('tags', async () => {
    const tagsToCreate = [
      { tag: randomId(), color: 'red' },
      { tag: randomId(), color: 'green' },
    ];

    const response = await Promise.all(
      tagsToCreate.map(({ tag, color }) =>
        http.post<Tag>({
          path: '/tags',
          query: { workspaceId },
          body: { tag, color },
        })
      )
    );

    const tagIds = response.map((r) => r.data.id);
    const tags = response.map((r) => {
      return {
        id: r.data.id,
        name: r.data.name,
        color: r.data.color,
      };
    });

    const { status, data: link } = await http.post<Link & { tags: [] }>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        domain,
        tagIds,
      },
    });

    expect(status).toEqual(200);
    expect(link.tags).toHaveLength(2);
    expect(link).toStrictEqual({
      ...expectedLink,
      url,
      tagId: expect.any(String), // TODO: Fix this
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: expect.arrayContaining(tags),
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await Promise.all([...tagIds.map((id) => h.deleteTag(id)), h.deleteLink(link.id)]);
  });

  test('custom social media cards', async () => {
    const title = 'custom title';
    const description = 'custom description';

    const { status, data: link } = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body: {
        url,
        domain,
        title,
        description,
      },
    });

    expect(status).toEqual(200);
    expect(link).toStrictEqual({
      ...expectedLink,
      url,
      title,
      description,
      userId: user.id,
      projectId,
      workspaceId,
      shortLink: `https://${domain}/${link.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${link.key}?qr=1`,
      tags: [],
    });
    expect(LinkSchema.strict().parse(link)).toBeTruthy();

    await h.deleteLink(link.id);
  });
});
