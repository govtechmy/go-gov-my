import { updateLinkBodySchema } from '@/lib/zod/schemas/links';
import { Link } from '@prisma/client';
import { afterAll, describe, expect, test } from 'vitest';
import { z } from 'zod';
import { randomId } from '../utils/helpers';
import { IntegrationHarness } from '../utils/integration';
import { link } from '../utils/resource';
import { expectedLink } from '../utils/schema';

const { domain, url } = link;

describe.sequential('PATCH /links/{linkId}', async () => {
  const h = new IntegrationHarness();
  const { workspace, http, user } = await h.init();
  const { workspaceId } = workspace;
  const externalId = randomId();

  const { data: link } = await http.post<Link>({
    path: '/links',
    query: { workspaceId },
    body: {
      url,
      domain,
      externalId,
    },
  });

  const toUpdate: Partial<z.infer<typeof updateLinkBodySchema>> = {
    key: randomId(),
    url: 'https://github.com/govtechmy/dub',
    title: 'Dub Inc',
    description: 'Open-source link management infrastructure.',
    publicStats: true,
    comments: 'This is a comment.',
    expiresAt: '2030-04-16T17:00:00.000Z',
    expiredUrl: 'https://github.com/expired',
    ios: 'https://apps.apple.com/app/1611158928',
    android: 'https://play.google.com/store/apps/details?id=com.disney.disneyplus',
    geo: {
      AF: `${url}/AF`,
    },
  };

  afterAll(async () => {
    await h.deleteLink(link.id);
  });

  test('update link using linkId', async () => {
    const { data: updatedLink } = await http.patch<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
      body: { ...toUpdate },
    });

    expect(updatedLink).toStrictEqual({
      ...expectedLink,
      ...toUpdate,
      domain,
      workspaceId,
      externalId,
      userId: user.id,
      expiresAt: '2030-04-16T17:00:00.000Z',
      projectId: workspaceId.replace('ws_', ''),
      shortLink: `https://${domain}/${toUpdate.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${toUpdate.key}?qr=1`,
      tags: [],
    });

    // Fetch the link
    const { data: fetchedLink } = await http.get<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
    });

    expect(fetchedLink).toStrictEqual({
      ...expectedLink,
      ...toUpdate,
      domain,
      workspaceId,
      externalId,
      userId: user.id,
      expiresAt: '2030-04-16T17:00:00.000Z',
      projectId: workspaceId.replace('ws_', ''),
      shortLink: `https://${domain}/${toUpdate.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${toUpdate.key}?qr=1`,
      tags: [],
    });
  });

  // Archive the link
  test('archive link', async () => {
    const { status, data: updatedLink } = await http.patch<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
      body: {
        archived: true,
      },
    });

    expect(status).toEqual(200);
    expect(updatedLink).toStrictEqual({
      ...expectedLink,
      ...toUpdate,
      domain,
      workspaceId,
      externalId,
      archived: true,
      userId: user.id,
      expiresAt: '2030-04-16T17:00:00.000Z',
      projectId: workspaceId.replace('ws_', ''),
      shortLink: `https://${domain}/${toUpdate.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${toUpdate.key}?qr=1`,
      tags: [],
    });

    // Fetch the link
    const { data: archivedLink } = await http.get<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
    });

    expect(archivedLink.archived).toEqual(true);
  });

  // Unarchive the link
  test('unarchive link', async () => {
    const { status, data: updatedLink } = await http.patch<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
      body: {
        archived: false,
      },
    });

    expect(status).toEqual(200);
    expect(updatedLink).toStrictEqual({
      ...expectedLink,
      ...toUpdate,
      domain,
      workspaceId,
      externalId,
      archived: false,
      userId: user.id,
      expiresAt: '2030-04-16T17:00:00.000Z',
      projectId: workspaceId.replace('ws_', ''),
      shortLink: `https://${domain}/${toUpdate.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${toUpdate.key}?qr=1`,
      tags: [],
    });

    // Fetch the link
    const { data: unarchivedLink } = await http.get<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
    });

    expect(unarchivedLink.archived).toEqual(false);
  });

  // Update the link using externalId
  test('update link using externalId', async () => {
    const { status, data: updatedLink } = await http.patch<Link>({
      path: `/links/ext_${externalId}`,
      query: { workspaceId },
      body: {
        url: 'https://github.com/govtechmy',
      },
    });

    expect(status).toEqual(200);
    expect(updatedLink).toStrictEqual({
      ...expectedLink,
      ...toUpdate,
      domain,
      workspaceId,
      externalId,
      archived: false,
      userId: user.id,
      url: 'https://github.com/govtechmy',
      expiresAt: '2030-04-16T17:00:00.000Z',
      projectId: workspaceId.replace('ws_', ''),
      shortLink: `https://${domain}/${toUpdate.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${toUpdate.key}?qr=1`,
      tags: [],
    });

    // Fetch the link
    const { data: linkUpdated } = await http.get<Link>({
      path: `/links/ext_${externalId}`,
      query: { workspaceId },
    });

    expect(linkUpdated.url).toEqual('https://github.com/govtechmy');
  });
});

describe.sequential('PUT /links/{linkId} (backwards compatibility)', async () => {
  const h = new IntegrationHarness();
  const { workspace, http, user } = await h.init();
  const { workspaceId } = workspace;
  const externalId = randomId();

  const { data: link } = await http.post<Link>({
    path: '/links',
    query: { workspaceId },
    body: {
      url,
      domain,
      externalId,
    },
  });

  const toUpdate: Partial<z.infer<typeof updateLinkBodySchema>> = {
    key: randomId(),
    url: 'https://github.com/govtechmy/dub',
    title: 'Dub Inc',
    description: 'Open-source link management infrastructure.',
    publicStats: true,
    comments: 'This is a comment.',
    expiresAt: '2030-04-16T17:00:00.000Z',
    expiredUrl: 'https://github.com/expired',
    ios: 'https://apps.apple.com/app/1611158928',
    android: 'https://play.google.com/store/apps/details?id=com.disney.disneyplus',
    geo: {
      AF: `${url}/AF`,
    },
  };

  afterAll(async () => {
    await h.deleteLink(link.id);
  });

  test('update link using PUT', async () => {
    const { data: updatedLink } = await http.put<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
      body: { ...toUpdate },
    });

    expect(updatedLink).toStrictEqual({
      ...expectedLink,
      ...toUpdate,
      domain,
      workspaceId,
      externalId,
      userId: user.id,
      expiresAt: '2030-04-16T17:00:00.000Z',
      projectId: workspaceId.replace('ws_', ''),
      shortLink: `https://${domain}/${toUpdate.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${toUpdate.key}?qr=1`,
      tags: [],
    });

    // Fetch the link
    const { data: fetchedLink } = await http.get<Link>({
      path: `/links/${link.id}`,
      query: { workspaceId },
    });

    expect(fetchedLink).toStrictEqual({
      ...expectedLink,
      ...toUpdate,
      domain,
      workspaceId,
      externalId,
      userId: user.id,
      expiresAt: '2030-04-16T17:00:00.000Z',
      projectId: workspaceId.replace('ws_', ''),
      shortLink: `https://${domain}/${toUpdate.key}`,
      qrCode: `https://api.dub.co/qr?url=https://${domain}/${toUpdate.key}?qr=1`,
      tags: [],
    });
  });
});
