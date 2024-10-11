import { Link } from '@prisma/client';
import { expect, test } from 'vitest';
import { IntegrationHarness } from '../utils/integration';
import { link } from '../utils/resource';

const { domain, url } = link;

const cases = [
  {
    name: 'create link with invalid destination url',
    body: {
      domain,
      url: 'invalid',
    },
    expected: {
      status: 422,
      data: {
        error: {
          code: 'unprocessable_entity',
          message: 'custom: url: Invalid URL',
          doc_url:
            'https://go.gov.my/docs/api-reference/errors#unprocessable-entity',
        },
      },
    },
  },
  {
    name: 'create link with invalid tag id',
    body: {
      domain,
      url,
      tagIds: ['invalid'],
    },
    expected: {
      status: 422,
      data: {
        error: {
          code: 'unprocessable_entity',
          message: 'Invalid tagIds detected: invalid',
          doc_url:
            'https://go.gov.my/docs/api-reference/errors#unprocessable-entity',
        },
      },
    },
  },
];

cases.forEach(({ name, body, expected }) => {
  test(name, async (ctx) => {
    const h = new IntegrationHarness(ctx);
    const { workspace, http } = await h.init();
    const { workspaceId } = workspace;

    const response = await http.post<Link>({
      path: '/links',
      query: { workspaceId },
      body,
    });

    expect(response).toEqual(expected);
  });
});
