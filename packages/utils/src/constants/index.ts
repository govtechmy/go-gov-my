export * from "./cctlds";
export * from "./countries";
export * from "./domains";
export * from "./framer-motion";
export * from "./layout";
export * from "./locale";
export * from "./localhost";
export * from "./middleware";
export * from "./misc";
export * from "./pricing";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "GoGovMy";

export const SHORT_DOMAIN =
  process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN || "go.gov.my";

export const HOME_DOMAIN = `https://${process.env.NEXT_PUBLIC_APP_DOMAIN}`;

export const APP_HOSTNAMES = new Set([
  `app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  `preview.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  "localhost:8888",
  "localhost",
]);

export const APP_DOMAIN =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
      ? `https://preview.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : "http://localhost:8888";

export const APP_DOMAIN_WITH_NGROK =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://app.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
      ? `https://preview.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : process.env.NEXT_PUBLIC_NGROK_URL || "http://localhost:8888";

export const API_HOSTNAMES = new Set([
  `api.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  `api-staging.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  `api.${SHORT_DOMAIN}`,
  "api.localhost:8888",
]);

export const API_DOMAIN =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? `https://api.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
    : process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
      ? `https://api-staging.${process.env.NEXT_PUBLIC_APP_DOMAIN}`
      : "http://api.localhost:8888";

export const ADMIN_HOSTNAMES = new Set([
  `admin.${process.env.NEXT_PUBLIC_APP_DOMAIN}`,
  "admin.localhost:8888",
]);

export const DUB_LOGO = `${APP_DOMAIN}/_static/logo.png`;
export const DUB_THUMBNAIL = `${APP_DOMAIN}/_static/GoGovMetaMs.png`;

export const DUB_WORKSPACE_ID = "cl7pj5kq4006835rbjlt2ofka";
export const LEGAL_WORKSPACE_ID = "clrflia0j0000vs7sqfhz9c7q";
export const LEGAL_USER_ID = "clqei1lgc0000vsnzi01pbf47";

export const DUB_DOMAINS = [
  {
    id: "clce1z7ch00j0rbstbjufva4j",
    slug: SHORT_DOMAIN,
    verified: true,
    primary: true,
    archived: false,
    publicStats: false,
    target: `https://${APP_DOMAIN}`,
    type: "redirect",
    clicks: 0,
    allowedHostnames: [] as string[],
    projectId: DUB_WORKSPACE_ID,
  },
];

export const DUB_DOMAINS_ARRAY = DUB_DOMAINS.map((domain) => domain.slug);

export const DUB_DEMO_LINKS = [
  {
    id: "clqo10sum0006js08vutzfxt3",
    domain: SHORT_DOMAIN,
    key: "try",
  },
  {
    id: "clot0z5rg000djp08ue98hxkn",
    domain: "chatg.pt",
    key: "domains",
  },
  {
    id: "clp4jh9av0001l308ormavtlu",
    domain: "spti.fi",
    key: "hans",
  },
  {
    id: "cltgtsex40003ck8z444hum5u",
    domain: "git.new",
    key: "dub",
  },
  {
    id: "clp3k3yoi0001ju0874nz899q",
    domain: "amzn.id",
    key: "tv",
  },
];
