import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_MODE === "ssg" ? "export" : undefined,
  env: {
    LAST_UPDATED: new Date().toISOString(),
  },
};

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

export default withNextIntl(nextConfig);
