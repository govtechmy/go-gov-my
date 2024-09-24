// Farhan: Add this via database
const allowedDomains = ['gov.my', 'moe.gov.my', 'mof.gov.my', 'moh.gov.my']; // Add all allowed domains here

export const allowedDomain = (email: string, isLocal: boolean): boolean => {
  if (isLocal) return true;
  return allowedDomains.some((domain) => email.endsWith(`${domain}`));
};
