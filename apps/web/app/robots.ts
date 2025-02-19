import { SHORT_DOMAIN, isAllowedDomain } from '@dub/utils';
import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  let domain = headersList.get('host') as string;

  if (domain === 'localhost:8888') {
    // for local development and preview URLs
    domain = SHORT_DOMAIN;
  }

  if (isAllowedDomain(domain)) {
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
        },
      ],
      sitemap: `https://${domain}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: 'Googlebot', // for Googlebot
        allow: ['/$', '/api/og/'], // allow the home page and the OG image API
        disallow: '/', // disallow everything else
      },
      {
        userAgent: 'LinkedInBot', // for LinkedInBot
        allow: '/', // allow everything
      },
    ],
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
