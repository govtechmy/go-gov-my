import { processKey } from '@/lib/api/links/utils';
import { verifyRequestToken } from '@/lib/auth/requestToken';
import { prisma } from '@/lib/prisma';
import { getDomainWithoutWWW } from '@dub/utils';
import { NextRequest, NextResponse } from 'next/server';

type LinkCheckerResponse = {
  isValid: boolean;
  isExpired: boolean;
  agency?: {
    code: string;
    names: {
      ms: string;
      en: string;
    };
    logo: string | null;
  } | null;
  validUntil: string | null;
  redirectUrl: string | null;
  shortUrl: string | null;
};

type LinkCheckerRequest = {
  url: string;
};

async function isDomainValid(domain: string): Promise<boolean> {
  const cleanDomain = getDomainWithoutWWW(domain);
  return cleanDomain === process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN;
}

async function isLinkExists(domain: string, rawKey: string) {
  // Process the key first
  const processedKey = processKey(rawKey);
  if (processedKey === null) {
    return {
      exists: false,
      link: null,
      error: 'Invalid key',
    };
  }

  const link = await prisma.link.findFirst({
    where: {
      domain,
      key: processedKey,
    },
    include: {
      user: {
        include: {
          agency: true,
        },
      },
    },
  });

  if (!link) {
    return {
      exists: false,
      link: null,
      error: null,
    };
  }

  return {
    exists: true,
    link,
    error: null,
  };
}

export async function POST(req: NextRequest) {
  // Add authentication check at the start
  const authToken = req.headers.get('x-request-token');
  if (!authToken || !verifyRequestToken(authToken)) {
    return NextResponse.json(
      { message: 'Missing or invalid request token' },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const { url } = body as LinkCheckerRequest;

    if (!url) {
      return NextResponse.json(
        {
          message: 'Invalid payload',
        },
        { status: 400 },
      );
    }

    try {
      // Add protocol if it doesn't exist
      const urlWithProtocol =
        url.startsWith('http://') || url.startsWith('https://')
          ? url
          : `https://${url}`;

      const urlObj = new URL(urlWithProtocol);
      const domain = urlObj.hostname;
      // Get the pathname and remove query parameters
      const pathWithoutQuery = urlObj.pathname.split('?')[0];
      const key = pathWithoutQuery.slice(1); // Remove leading slash

      const isValidDomain = await isDomainValid(domain);
      if (!isValidDomain) {
        return NextResponse.json(
          {
            isValid: false,
            isExpired: false,
            agency: null,
            validUntil: null,
            redirectUrl: null,
            shortUrl: null,
          } as LinkCheckerResponse,
          { status: 200 },
        );
      }

      const { exists, link, error } = await isLinkExists(domain, key);

      if (error) {
        return NextResponse.json(
          {
            isValid: false,
            isExpired: false,
            agency: null,
            validUntil: null,
            redirectUrl: null,
            shortUrl: null,
          } as LinkCheckerResponse,
          { status: 200 },
        );
      }

      if (!exists) {
        return NextResponse.json(
          {
            isValid: false,
            isExpired: false,
            agency: null,
            validUntil: null,
            redirectUrl: null,
            shortUrl: null,
          } as LinkCheckerResponse,
          { status: 200 },
        );
      }

      const now = new Date();
      const isExpired = link!.expiresAt
        ? new Date(link!.expiresAt) < now
        : false;

      const response: LinkCheckerResponse = {
        isValid: true,
        isExpired,
        agency: link!.user?.agency
          ? {
              code: link!.user.agency.code,
              names: link!.user.agency.names as { ms: string; en: string },
              logo: link!.user.agency.logo,
            }
          : null,
        validUntil: link!.expiresAt
          ? new Date(link!.expiresAt).toISOString()
          : null,
        redirectUrl: isExpired ? link!.expiredUrl || null : link!.url,
        shortUrl:
          url.startsWith('http://') || url.startsWith('https://')
            ? url
            : `https://${url}`,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (urlError) {
      return NextResponse.json(
        {
          isValid: false,
          isExpired: false,
          agency: null,
          validUntil: null,
          redirectUrl: null,
          shortUrl: null,
        } as LinkCheckerResponse,
        { status: 200 },
      );
    }
  } catch (error) {
    console.error('Link checker error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    );
  }
}
