import { LinkProps } from "../types";

// This should be like the object model
export interface LinkDTO {
  id: string; // Table.Link.Id
  slug: string; // original should be: key
  url: string; // main original url
  expiresAt: Date | null; // link expiry
  ios: string | null; // for ios url redir link
  android: string | null; // for android redir link
  geo: Record<string, string> | null; // geo-specific links
  imageUrl: string | null; // image URL for OG meta tags
  title: string | null;
  description: string | null;
  createdAt: Date | null;
}

// This should be able to reuse anywhere.
export async function processDTOLink(response: LinkProps): Promise<LinkDTO> {
  const linkDTO: LinkDTO = {
    id: response.id,
    slug: response.key,
    url: response.url,
    expiresAt: response.expiresAt,
    ios: response.ios,
    android: response.android,
    geo:
      typeof response.geo === "string"
        ? JSON.parse(response.geo)
        : response.geo,
    imageUrl: response.image,
    title: response.title,
    description: response.description,
    createdAt: response.createdAt,
  };

  return linkDTO;
}
