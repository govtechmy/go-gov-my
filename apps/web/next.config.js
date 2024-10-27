const REDIRECT_SEGMENTS = [
  'pricing',
  'blog',
  'help',
  'changelog',
  'tools',
  '_static',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: [
      '@react-email/components',
      '@react-email/render',
      '@react-email/tailwind',
    ],
    instrumentationHook: true,
  },
  webpack: (config, { webpack, isServer }) => {
    if (isServer) {
      config.plugins.push(
        // mute errors for unused typeorm deps
        new webpack.IgnorePlugin({
          resourceRegExp:
            /(^@google-cloud\/spanner|^@mongodb-js\/zstd|^aws-crt|^aws4$|^pg-native$|^mongodb-client-encryption$|^@sap\/hana-client$|^@sap\/hana-client\/extension\/Stream$|^snappy$|^react-native-sqlite-storage$|^bson-ext$|^cardinal$|^kerberos$|^hdb-pool$|^sql.js$|^sqlite3$|^better-sqlite3$|^typeorm-aurora-data-api-driver$|^pg-query-stream$|^oracledb$|^mysql$|^snappy\/package\.json$|^cloudflare:sockets$)/,
        }),
      );
    }

    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        hostname: 'assets.dub.co', // for Dub's static assets
      },
      {
        hostname: 'dubassets.com', // for Dub's user generated images
      },
      {
        hostname: 'www.google.com',
      },
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'faisalman.github.io',
      },
      {
        hostname: 'api.dicebear.com',
      },
      {
        hostname: 'pbs.twimg.com',
      },
      {
        hostname: 'lh3.googleusercontent.com',
      },
      {
        hostname: 'avatars.githubusercontent.com',
      },
      {
        hostname: 'media.cleanshot.cloud', // only for staging purposes
      },
      {
        hostname: 'gogov-web-dev.s3.ap-southeast-1.amazonaws.com',
      },
      {
        hostname: 'app.pautan.org',
      },
      {
        hostname: 'app.go.gov.my',
      },
      {
        hostname: 'pautan.org',
      },
      {
        hostname: 'go.gov.my',
      },
    ],
    domains: [
      'gogov-web-dev.s3.ap-southeast-1.amazonaws.com',
      'app.pautan.org',
      'app.go.gov.my',
      'pautan.org',
      'go.gov.my',
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'app.go.gov.my',
          },
        ],
        destination: 'https://app.go.gov.my',
        permanent: true,
        statusCode: 301,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'app.go.gov.my',
          },
        ],
        destination: 'https://app.go.gov.my/:path*',
        permanent: true,
        statusCode: 301,
      },
      ...REDIRECT_SEGMENTS.map(
        (segment) => (
          {
            source: `/${segment}`,
            has: [
              {
                type: 'host',
                value: 'pautan.org',
              },
            ],
            destination: `https://go.gov.my/${segment}`,
            permanent: true,
            statusCode: 301,
          },
          {
            source: `/${segment}/:path*`,
            has: [
              {
                type: 'host',
                value: 'dub.sh',
              },
            ],
            destination: `https://go.gov.my/${segment}/:path*`,
            permanent: true,
            statusCode: 301,
          }
        ),
      ),
      {
        source: '/metatags',
        has: [
          {
            type: 'host',
            value: 'dub.sh',
          },
        ],
        destination: 'https://go.gov.my/tools/metatags',
        permanent: true,
        statusCode: 301,
      },
      {
        source: '/metatags',
        has: [
          {
            type: 'host',
            value: 'go.gov.my',
          },
        ],
        destination: '/tools/metatags',
        permanent: true,
        statusCode: 301,
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'pautan.org',
          },
        ],
        destination: 'https://pautan.org',
        permanent: true,
        statusCode: 301,
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'preview.pautan.org',
          },
        ],
        destination: 'https://preview.pautan.org',
        permanent: true,
        statusCode: 301,
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'go.gov.my',
          },
        ],
        destination: 'https://go.gov.my/en/admin',
        permanent: true,
        statusCode: 301,
      },
    ];
  },
};

module.exports = nextConfig;
