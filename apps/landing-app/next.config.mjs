import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    LAST_UPDATED: new Date().toISOString(),
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  },
};

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts');

export default withNextIntl(nextConfig);
