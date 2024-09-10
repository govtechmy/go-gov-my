import { encryptOutboxSecrets } from "kafka-consumer/utils/encryption";
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
  password?: string;
  banned: boolean;
  createdAt: Date | null;
}

// This should be able to reuse anywhere.
export async function processDTOLink(
  response: LinkProps & { password?: string },
): Promise<{ payload: LinkDTO; encryptedSecrets: string | null }> {
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
    password: response.password,
    banned: response.banned,
    createdAt: response.createdAt,
  };

  const secrets: Record<string, string> = {};
  let encryptedSecrets: string | null = null;

  // If a password is set, store it as a secret
  if (linkDTO.password) {
    const placeholder = "{{PASSWORD}}";
    secrets[placeholder] = linkDTO.password;
    linkDTO.password = placeholder;
  }

  const hasSecrets = Object.entries(secrets).length > 0;
  if (hasSecrets) {
    encryptedSecrets = await encryptOutboxSecrets(secrets);
  }

  return { payload: linkDTO, encryptedSecrets };
}
