import { isBlacklistedDomain, updateConfig } from '@/lib/edge-config';
import { getPangeaDomainIntel } from '@/lib/pangea';
import { prisma } from '@/lib/prisma';
import { NewLinkProps, ProcessedLinkProps, WorkspaceProps } from '@/lib/types';
import { checkIfUserExists, getRandomKey } from '@/lib/userinfos';
import {
  SHORT_DOMAIN,
  getApexDomain,
  getDomainWithoutWWW,
  getUrlFromString,
  isValidUrl,
  log,
  parseDateTime,
} from '@dub/utils';
import { combineTagIds, keyChecks, processKey } from './utils';

export async function processLink<T extends Record<string, any>>({
  payload,
  workspace,
  userId,
  bulk = false,
  skipKeyChecks = false, // only skip when key doesn't change (e.g. when editing a link)
}: {
  payload: NewLinkProps & T;
  workspace: WorkspaceProps;
  userId?: string;
  bulk?: boolean;
  skipKeyChecks?: boolean;
}): Promise<
  | {
      link: NewLinkProps & T;
      error: string;
      code?: string;
      status?: number;
    }
  | {
      link: ProcessedLinkProps & T;
      error: null;
      code?: never;
      status?: never;
    }
> {
  let { key, url, image, proxy, rewrite, expiredUrl, tagNames } = payload;

  let expiresAt: string | Date | null | undefined = payload.expiresAt;

  const tagIds = combineTagIds(payload);

  // url checks
  if (!url) {
    return {
      link: payload,
      error: 'Missing destination url.',
      code: 'bad_request',
    };
  }
  url = getUrlFromString(url);
  if (!isValidUrl(url)) {
    return {
      link: payload,
      error: 'Invalid destination url.',
      code: 'unprocessable_entity',
    };
  }

  // In GoGovMy, we removed custom domains. All links must use SHORT_DOMAIN.
  const domain = SHORT_DOMAIN;

  // check if user exists (if userId is passed)
  if (userId) {
    const userExists = await checkIfUserExists(userId);
    if (!userExists) {
      return {
        link: payload,
        error: 'Session expired. Please log in again.',
        code: 'not_found',
      };
    }
  }

  const isMaliciousLink = await maliciousLinkCheck(url);
  if (isMaliciousLink) {
    return {
      link: payload,
      error: 'Malicious URL detected',
      code: 'unprocessable_entity',
    };
  }

  if (!key) {
    key = await getRandomKey({
      domain,
      prefix: payload['prefix'],
    });
  } else if (!skipKeyChecks) {
    const processedKey = processKey(key);
    if (processedKey === null) {
      return {
        link: payload,
        error: 'Invalid key.',
        code: 'unprocessable_entity',
      };
    }
    key = processedKey;

    const response = await keyChecks({ domain, key, workspace });
    if (response.error) {
      return {
        link: payload,
        ...response,
      };
    }
  }

  if (bulk) {
    if (image) {
      return {
        link: payload,
        error: 'You cannot set custom social cards with bulk link creation.',
        code: 'unprocessable_entity',
      };
    }
    if (rewrite) {
      return {
        link: payload,
        error: 'You cannot use link cloaking with bulk link creation.',
        code: 'unprocessable_entity',
      };
    }

    // only perform tag validity checks if:
    // - not bulk creation (we do that check separately in the route itself)
    // - tagIds are present
  } else if (tagIds && tagIds.length > 0) {
    try {
      const tags = await prisma.tag.findMany({
        select: {
          id: true,
        },
        where: { projectId: workspace?.id, id: { in: tagIds } },
      });

      if (tags.length !== tagIds.length) {
        return {
          link: payload,
          error:
            'Invalid tagIds detected: ' +
            tagIds.filter((tagId) => tags.find(({ id }) => tagId === id) === undefined).join(', '),
          code: 'unprocessable_entity',
        };
      }
    } catch (e) {
      if (e?.code === 'P2023') {
        return {
          link: payload,
          error: 'Invalid tagIds detected: invalid',
          code: 'unprocessable_entity',
        };
      }
      return {
        link: payload,
        error: e?.meta?.message,
        code: e.code,
      };
    }
  } else if (tagNames && tagNames.length > 0) {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
      },
      where: {
        projectId: workspace?.id,
        name: { in: tagNames },
      },
    });

    if (tags.length !== tagNames.length) {
      return {
        link: payload,
        error:
          'Invalid tagNames detected: ' +
          tagNames
            .filter((tagName) => tags.find(({ name }) => tagName === name) === undefined)
            .join(', '),
        code: 'unprocessable_entity',
      };
    }
  }

  /// Farhan 20240912: We don't need this anymore since we are connecting to GovTech AWS SSO
  // custom social media image checks (see if R2 is configured)
  // if (proxy && !process.env.STORAGE_SECRET_ACCESS_KEY) {
  //   return {
  //     link: payload,
  //     error: "Missing storage access key.",
  //     code: "bad_request",
  //   };
  // }

  // expire date checks
  if (expiresAt) {
    const datetime = parseDateTime(expiresAt);
    if (!datetime) {
      return {
        link: payload,
        error: 'Invalid expiration date.',
        code: 'unprocessable_entity',
      };
    }
    expiresAt = datetime;
    if (expiredUrl) {
      expiredUrl = getUrlFromString(expiredUrl);
      if (!isValidUrl(expiredUrl)) {
        return {
          link: payload,
          error: 'Invalid expired URL.',
          code: 'unprocessable_entity',
        };
      }
    }
  }

  // remove polyfill attributes from payload
  delete payload['shortLink'];
  delete payload['qrCode'];
  delete payload['prefix'];

  return {
    link: {
      ...payload,
      domain,
      key,
      // we're redefining these fields because they're processed in the function
      url,
      expiresAt,
      expiredUrl,
      // make sure projectId is set to the current workspace
      projectId: workspace.id,
      // if userId is passed, set it (we don't change the userId if it's already set, e.g. when editing a link)
      ...(userId && {
        userId,
      }),
    },
    error: null,
  };
}

async function maliciousLinkCheck(url: string) {
  const [domain, apexDomain] = [getDomainWithoutWWW(url), getApexDomain(url)];

  if (!domain) {
    return false;
  }

  const domainBlacklisted = await isBlacklistedDomain({ domain, apexDomain });
  if (domainBlacklisted === true) {
    return true;
  } else if (domainBlacklisted === 'whitelisted') {
    return false;
  }

  // Check with Pangea for domain reputation
  if (process.env.PANGEA_API_KEY) {
    try {
      const response = await getPangeaDomainIntel(domain);

      const verdict = response.result.data[apexDomain].verdict;
      console.log('Pangea verdict for domain', apexDomain, verdict);

      if (verdict === 'benign') {
        await updateConfig({
          key: 'whitelistedDomains',
          value: domain,
        });
        return false;
      } else if (verdict === 'malicious' || verdict === 'suspicious') {
        await Promise.all([
          updateConfig({
            key: 'domains',
            value: domain,
          }),
          log({
            message: `Suspicious link detected via Pangea → ${url}`,
            type: 'links',
            mention: true,
          }),
        ]);

        return true;
      }
    } catch (e) {
      console.error('Error checking domain with Pangea', e);
    }
  }

  return false;
}
