import { APP_NAME, SHORT_DOMAIN } from '.';

export const DEFAULT_REDIRECTS = {
  home: `https://${SHORT_DOMAIN}`,
  signin: `https://${SHORT_DOMAIN}/login`,
  login: `https://${SHORT_DOMAIN}/login`,
  register: `https://${SHORT_DOMAIN}/login`,
  signup: `https://${SHORT_DOMAIN}/login`,
  app: `https://app.${SHORT_DOMAIN}`,
  dashboard: `https://app.${SHORT_DOMAIN}`,
  links: `https://app.${SHORT_DOMAIN}/links`,
  settings: `https://app.${SHORT_DOMAIN}/settings`,
};

export const DUB_HEADERS = {
  headers: {
    'x-powered-by': `${APP_NAME} - Malaysia's open-source link management infrastructure`,
  },
};
