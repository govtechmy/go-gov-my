// This should be like the object model
export interface LinkDTO {
  id: string; // Table.Link.Id
  slug: string; // original should be: key
  url: string; // main original url
  expiresAt: Date | null; // link expiry
  ios: string | null; // for ios url redir link
  android: string | null; // for android redir link
  geo: Record<string, string>; // geo-specific links
  createdAt: Date | null;
}

// This should be able to reuse anywhere.
export async function processDTOLink(response: any): Promise<LinkDTO> {
  const linkDTO: LinkDTO = {
    id: response.id,
    slug: response.key,
    url: response.url,
    expiresAt: response.expiresAt,
    ios: response.ios,
    android: response.android,
    geo: response.geo,
    createdAt: response.createdAt,
  };

  return linkDTO;
}
