import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  assetPrefix: process.env.ASSET_PREFIX,
  env: {
    LAST_UPDATED: new Date().toISOString(),
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

export default withNextIntl(nextConfig);
