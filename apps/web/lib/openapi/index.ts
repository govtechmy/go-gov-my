import { openApiErrorResponses } from '@/lib/openapi/responses';
import { LinkSchema } from '@/lib/zod/schemas/links';
import { TagSchema } from '@/lib/zod/schemas/tags';
import { WorkspaceSchema } from '@/lib/zod/schemas/workspaces';
import { API_DOMAIN } from '@dub/utils';
import { createDocument } from 'zod-openapi';
import { clickAnalyticsPaths } from './analytics/clicks';
import { linksPaths } from './links';
import { metatagsPath } from './metatags';
import { qrCodePaths } from './qr';
import { tagsPaths } from './tags';
import { workspacesPaths } from './workspaces';

export const document = createDocument({
  openapi: '3.0.3',
  info: {
    title: 'GoGovMy API',
    description: "GoGovMY - Malaysia's open-source link management infrastructure.",
    version: '0.0.1',
    contact: {
      name: 'GoGovMy Support',
      email: 'support@go.gov.my',
      url: 'https://go.gov.my/api',
    },
    license: {
      name: 'AGPL-3.0 license',
      url: 'https://github.com/govtechmy/dub/blob/main/LICENSE.md',
    },
  },
  servers: [
    {
      url: API_DOMAIN,
      description: 'Production API',
    },
  ],
  paths: {
    ...linksPaths,
    ...qrCodePaths,
    ...clickAnalyticsPaths,
    ...workspacesPaths,
    ...tagsPaths,
    ...metatagsPath,
  },
  components: {
    schemas: {
      LinkSchema,
      WorkspaceSchema,
      TagSchema,
    },
    securitySchemes: {
      token: {
        type: 'http',
        description: 'Default authentication mechanism',
        scheme: 'bearer',
        'x-speakeasy-example': 'DUB_API_KEY',
      },
    },
    responses: {
      ...openApiErrorResponses,
    },
  },
  'x-speakeasy-globals': {
    parameters: [
      {
        'x-speakeasy-globals-hidden': true,
        name: 'workspaceId',
        in: 'query',
        required: true,
        schema: {
          type: 'string',
        },
      },
      {
        'x-speakeasy-globals-hidden': true,
        name: 'projectSlug',
        in: 'query',
        deprecated: true,
        schema: {
          type: 'string',
        },
      },
    ],
  },
});
