import { nanoid, punyEncode } from "@dub/utils";
import { prisma } from "lib/prisma";
import { WorkspaceProps } from "./types";

export const getWorkspaceViaEdge = async (workspaceId: string) => {
  const workspace = await prisma.project.findUnique({
    where: { id: workspaceId.replace("ws_", "") },
    include: {
      users: true, // Include users relation
    },
  });

  return (workspace as WorkspaceProps) || null;
};

export const checkIfKeyExists = async (domain: string, key: string) => {
  const link = await prisma.link.findFirst({
    where: {
      domain: domain,
      key: punyEncode(decodeURIComponent(key)),
    },
  });

  return Boolean(link);
};

export const checkIfUserExists = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return Boolean(user);
};

export const getLinkViaEdge = async (domain: string, key: string) => {
  const link = await prisma.link.findFirst({
    where: {
      domain: domain,
      key: punyEncode(decodeURIComponent(key)),
    },
  });

  return link || null;
};

export const getLink = async ({
  domain,
  key,
}: {
  domain: string;
  key: string;
}) => {
  const link = await prisma.link.findFirst({
    where: {
      domain: domain,
      key: punyEncode(decodeURIComponent(key)),
    },
  });

  return link || null;
};

export async function getRandomKey({
  domain,
  prefix,
}: {
  domain: string;
  prefix?: string;
}): Promise<string> {
  /* recursively get random key till it gets one that's available */
  let key = nanoid();
  if (prefix) {
    key = `${prefix.replace(/^\/|\/$/g, "")}/${key}`;
  }
  const link = await prisma.link.findFirst({
    where: {
      domain: domain,
      key: punyEncode(decodeURIComponent(key)),
    },
  });
  if (link) {
    // by the off chance that key already exists
    return getRandomKey({ domain, prefix });
  } else {
    return key;
  }
}
