import { nanoid, punyEncode } from "@dub/utils";
import { prisma } from "lib/prisma";
import { DomainProps, WorkspaceProps } from "./types";

export const getWorkspaceViaEdge = async (workspaceId: string) => {
  const workspace = await prisma.project.findUnique({
    where: { id: workspaceId.replace("ws_", "") },
    include: {
      domains: true, // Include domains relation
      users: true, // Include users relation
    },
  });

  return (workspace as WorkspaceProps) || null;
};

export const getDomainViaEdge = async (domain: string) => {
  const domainRecord = await prisma.domain.findUnique({
    where: { slug: domain },
  });

  return (domainRecord as DomainProps) || null;
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

export const getDomainOrLink = async ({
  domain,
  key,
}: {
  domain: string;
  key?: string;
}) => {
  if (!key || key === "_root") {
    const data = await prisma.domain.findUnique({
      where: { slug: domain },
    });

    if (!data) return null;

    return {
      ...data,
      key: "_root",
      url: data?.target,
    };
  } else {
    const link = await prisma.link.findFirst({
      where: {
        domain: domain,
        key: punyEncode(decodeURIComponent(key)),
      },
    });

    return link || null;
  }
};

export async function getRandomKey({
  domain,
  prefix,
  long,
}: {
  domain: string;
  prefix?: string;
  long?: boolean;
}): Promise<string> {
  /* recursively get random key till it gets one that's available */
  let key = long ? nanoid(69) : nanoid();
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
    return getRandomKey({ domain, prefix, long });
  } else {
    return key;
  }
}
