export type LinkCheckerResponse = {
    isValid: boolean;
    isExpired: boolean;
    agency?: {
      code: string;
      names: {
        ms: string;
        en: string;
      };
      logo: string | null;
    } | null;
    validUntil: string | null;
    redirectUrl: string | null;
    shortUrl: string | null;
};
  
export type LinkCheckerRequest = {
    url: string;
    token: string;
};