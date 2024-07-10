import { APP_NAME } from ".";

export const DEFAULT_REDIRECTS = {
  home: "https://go.gov.my",
  signin: "https://go.gov.my/login",
  login: "https://go.gov.my/login",
  register: "https://go.gov.my/register",
  signup: "https://go.gov.my/register",
  app: "https://go.gov.my",
  dashboard: "https://go.gov.my",
  links: "https://go.go.my/links",
  settings: "https://go.gov.my/settings",
  welcome: "https://go.gov.my/welcome",
};

export const DUB_HEADERS = {
  headers: {
    "x-powered-by": `${APP_NAME} - Malaysia's open-source link management infrastructure`,
  },
};
