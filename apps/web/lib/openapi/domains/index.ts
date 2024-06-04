import { ZodOpenApiPathsObject } from "zod-openapi";
import { listDomains } from "./list-domains";
import { setPrimaryDomain } from "./set-primary-domain";
import { transferDomain } from "./transfer-domain";

export const domainsPaths: ZodOpenApiPathsObject = {
  "/domains": {
    get: listDomains,
  },
  "/domains/{slug}/primary": {
    post: setPrimaryDomain,
  },
  "/domains/{slug}/transfer": {
    post: transferDomain,
  },
};
