// This should be like the object model
export interface LinkDTO {
  id: string;
  slug: string; // original should be: key
  url: string;
  expiresAt: Date | null;
  ios: string | null;
  android: string | null;
  createdAt: Date | null;
  action: "create-link" | "delete-link" | "update-link";
  outboxId: string;
  uploadedImageUrl: string | null;
}

// This should be able to reuse anywhere.
export async function processDTOLink(
  response: any,
  action: "create-link" | "delete-link" | "update-link",
  outboxId: string,
  uploadedImageUrl: string | null,
): Promise<LinkDTO> {
  const linkDTO: LinkDTO = {
    id: response.id,
    slug: response.key,
    url: response.url,
    expiresAt: response.expiresAt,
    ios: response.ios,
    android: response.android,
    createdAt: response.createdAt,
    action: action,
    outboxId: outboxId,
    uploadedImageUrl: uploadedImageUrl,
  };

  return linkDTO;
}
