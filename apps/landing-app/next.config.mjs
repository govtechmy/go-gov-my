import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', //process.env.BUILD_MODE === "ssg" ? "export" : undefined,
  env: {
    LANDING_STATS_JSON_URL: process.env.LANDING_STATS_JSON_URL,
    LAST_UPDATED: process.env.LAST_UPDATED,
    API_BASE_URL: process.env.API_BASE_URL,
    APP_DOMAIN: process.env.APP_DOMAIN,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    APP_URL: process.env.APP_URL,
    LANDING_DOMAIN: process.env.LANDING_DOMAIN,
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

export default withNextIntl(nextConfig);
