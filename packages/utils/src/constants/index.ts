export * from './cctlds';
export * from './countries';
export * from './domains';
export * from './framer-motion';
export * from './layout';
export * from './locale';
export * from './localhost';
export * from './middleware';
export * from './misc';
export * from './pricing';

if (!process.env.NEXT_PUBLIC_APP_NAME) {
  throw Error('missing env variable NEXT_PUBLIC_APP_NAME');
}
if (!process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN) {
  throw Error('missing env variable NEXT_PUBLIC_APP_SHORT_DOMAIN');
}
if (!process.env.NEXT_PUBLIC_APP_DOMAIN) {
  throw Error('missing env variable NEXT_PUBLIC_APP_DOMAIN');
}

// This should be your app name i.e.GoGovMY
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

// This should be your app short link domain i.e. go.gov.my/{{slug}}
export const SHORT_DOMAIN = process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN;

// This should be your main short link domain i.e. go.gov.my
export const HOME_DOMAIN = `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`;

export const APP_HOSTNAMES = new Set([
  `app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  `preview.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  'localhost:8888',
  'localhost',
]);

export const APP_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? `https://app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : 'http://localhost:8888';

export const APP_DOMAIN_WITH_NGROK =
  process.env.NODE_ENV === 'production'
    ? `https://app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : process.env.NEXT_PUBLIC_NGROK_URL || 'http://localhost:8888';

export const API_HOSTNAMES = new Set([
  `api.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  `api-staging.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  `api.${SHORT_DOMAIN}`,
  'api.localhost:8888',
]);

export const API_DOMAIN =
  process.env.NODE_ENV === 'production'
    ? `https://api.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : 'http://api.localhost:8888';

export const ADMIN_HOSTNAMES = new Set([
  `admin.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  'admin.localhost:8888',
]);

export const DUB_LOGO = `${APP_DOMAIN}/_static/logo.png`;
export const DUB_THUMBNAIL_MS = `https://s3.ap-southeast-1.amazonaws.com/pautan.org/og/images/ms-MY.png`;
export const DUB_THUMBNAIL_EN = `https://s3.ap-southeast-1.amazonaws.com/pautan.org/og/images/en-MY.png`;

export const DUB_WORKSPACE_ID = 'cl7pj5kq4006835rbjlt2ofka';
export const LEGAL_WORKSPACE_ID = 'clrflia0j0000vs7sqfhz9c7q';
export const LEGAL_USER_ID = 'clqei1lgc0000vsnzi01pbf47';

export const ALLOWED_DOMAINS = [
  {
    id: 'clce1z7ch00j0rbstbjufva4j',
    slug: SHORT_DOMAIN,
    verified: true,
    primary: true,
    archived: false,
    publicStats: false,
    target: `https://${APP_DOMAIN}`,
    type: 'redirect',
    clicks: 0,
    allowedHostnames: [] as string[],
    projectId: DUB_WORKSPACE_ID,
  },
];

export const DUB_DOMAINS_ARRAY = ALLOWED_DOMAINS.map((domain) => domain.slug);

export const DUB_DEMO_LINKS = [
  {
    id: 'clqo10sum0006js08vutzfxt3',
    domain: SHORT_DOMAIN,
    key: 'try',
  },
];
