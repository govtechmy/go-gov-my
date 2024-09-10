import { processDTOLink } from "@/lib/dto/link.dto";
import { prisma } from "@/lib/prisma";
import { formatRedisLink, redis } from "@/lib/redis";
import { isStored, storage } from "@/lib/storage";
import { LinkProps, ProcessedLinkProps } from "@/lib/types";
import { SHORT_DOMAIN, getParamsFromURL, truncate } from "@dub/utils";
import { trace } from "@opentelemetry/api";
import { Prisma } from "@prisma/client";
import { waitUntil } from "@vercel/functions";
import { OUTBOX_ACTIONS } from "kafka-consumer/utils/actions";
import { addToHistory } from "./add-to-history";
import generateIdempotencyKey from "./create-idempotency-key";
import { combineTagIds, transformLink } from "./utils";

const REDIRECT_SERVER_BASE_URL =
  process.env.REDIRECT_SERVER_URL || "http://localhost:3002";

export async function updateLink({
  oldDomain = SHORT_DOMAIN,
  oldKey,
  updatedLink,
  sessionUserId,
}: {
  oldDomain?: string;
  oldKey: string;
  updatedLink: ProcessedLinkProps &
    Pick<LinkProps, "id" | "clicks" | "lastClicked" | "updatedAt">;
  /** To store user id who created/update the link in history */
  sessionUserId: string;
}) {
  let {
    id,
    domain,
    key,
    url,
    expiresAt,
    title,
    description,
    image,
    proxy,
    geo,
  } = updatedLink;
  const changedKey = key.toLowerCase() !== oldKey.toLowerCase();
  const changedDomain = domain !== oldDomain;
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordLinks");

  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } =
    getParamsFromURL(url);

  // exclude fields that should not be updated
  const {
    id: _,
    clicks,
    lastClicked,
    updatedAt,
    tagId,
    tagIds,
    tagNames,
    password,
    ...rest
  } = updatedLink;

  const combinedTagIds = combineTagIds({ tagId, tagIds });

  const response = await prisma.link.update({
    where: {
      id,
    },
    data: {
      ...rest,
      key,
      title: truncate(title, 120),
      description: truncate(description, 240),
      image:
        proxy && image && !isStored(image)
          ? `${process.env.STORAGE_BASE_URL}/images/${id}`
          : image,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      geo: geo || Prisma.JsonNull,

      // Associate tags by tagNames
      ...(tagNames &&
        updatedLink.projectId && {
          tags: {
            deleteMany: {},
            create: tagNames.map((tagName) => ({
              tag: {
                connect: {
                  name_projectId: {
                    name: tagName,
                    projectId: updatedLink.projectId as string,
                  },
                },
              },
            })),
          },
        }),

      // Associate tags by IDs (takes priority over tagNames)
      ...(combinedTagIds && {
        tags: {
          deleteMany: {},
          create: combinedTagIds.map((tagId) => ({
            tagId,
          })),
        },
      }),
    },
    include: {
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
  });

  // Transform into DTOs
  const { payload, encryptedSecrets } = await processDTOLink({
    ...response,
    password,
  });

  // For simplicity and centralized, lets create the idempotency key at this level
  const headersJSON = generateIdempotencyKey(payload.id, response.updatedAt);

  try {
    waitUntil(
      Promise.all([
        // record link in Redis
        redis.hset(updatedLink.domain.toLowerCase(), {
          [updatedLink.key.toLowerCase()]: JSON.stringify(
            await formatRedisLink(response),
          ),
        }),
        // if key is changed: delete the old key in Redis
        (changedDomain || changedKey) &&
          redis.hdel(oldDomain.toLowerCase(), oldKey.toLowerCase()),
        // if proxy is true and image is not stored in R2, upload image to R2
        proxy &&
          image &&
          !isStored(image) &&
          storage.upload(`images/${id}`, image, {
            width: 1200,
            height: 630,
          }),
        prisma.webhookOutbox.create({
          data: {
            action: OUTBOX_ACTIONS.UPDATE_LINK,
            // host: process.env.NEXT_PUBLIC_APP_DOMAIN || "go.gov.my",
            host: REDIRECT_SERVER_BASE_URL + "/links",
            payload: payload as unknown as Prisma.InputJsonValue,
            headers: headersJSON,
            partitionKey: payload.slug,
            encryptedSecrets,
          },
        }),
        addToHistory({
          ...response,
          type: "update",
          linkId: response.id,
          comittedByUserId: sessionUserId,
          timestamp: response.updatedAt,
        }),
      ]),
    );

    // Log results to OpenTelemetry
    span.addEvent("recordLinks", {
      link_id: response.id,
      domain: response.domain,
      key: response.key,
      url: response.url,
      tag_ids: response.tags.map(({ tag }) => tag.id),
      workspace_id: response.projectId?.toString(),
      created_at: response.createdAt.toISOString(),
      updated_at: response.updatedAt.toISOString(),
    });

    return transformLink(response);
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
