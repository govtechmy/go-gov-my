import { processDTOLink } from "@/lib/dto/link.dto";
import { prisma } from "@/lib/prisma";
import { formatRedisLink, redis } from "@/lib/redis";
import { isStored, storage } from "@/lib/storage";
import { ProcessedLinkProps } from "@/lib/types";
import { getParamsFromURL, truncate } from "@dub/utils";
import { trace } from "@opentelemetry/api";
import { Prisma } from "@prisma/client";
import { waitUntil } from "@vercel/functions";
import { OUTBOX_ACTIONS } from "kafka-consumer/actions";
import { addToHistory } from "./add-to-history";
import generateIdempotencyKey from "./create-idempotency-key";
import { combineTagIds, transformLink } from "./utils";

export async function createLink(
  link: ProcessedLinkProps,
  {
    sessionUserId,
  }: {
    /** To store user id who created/update the link in history */
    sessionUserId: string;
  },
) {
  let { key, url, expiresAt, title, description, image, proxy, geo } = link;
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordLinks");

  const combinedTagIds = combineTagIds(link);

  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } =
    getParamsFromURL(url);

  const { tagId, tagIds, tagNames, ...rest } = link;

  const response = await prisma.link.create({
    data: {
      ...rest,
      key,
      title: truncate(title, 120),
      description: truncate(description, 240),
      // if it's an uploaded image, make this null first because we'll update it later
      image: proxy && image && !isStored(image) ? null : image,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      geo: geo || Prisma.JsonNull,

      // Associate tags by tagNames
      ...(tagNames?.length &&
        link.projectId && {
          tags: {
            create: tagNames.map((tagName) => ({
              tag: {
                connect: {
                  name_projectId: {
                    name: tagName,
                    projectId: link.projectId as string,
                  },
                },
              },
            })),
          },
        }),

      // Associate tags by IDs (takes priority over tagNames)
      ...(combinedTagIds &&
        combinedTagIds.length > 0 && {
          tags: {
            createMany: {
              data: combinedTagIds.map((tagId) => ({ tagId })),
            },
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

  const uploadedImageUrl = `${process.env.STORAGE_BASE_URL}/images/${response.id}`;

  // Transform into DTOs
  const linkDTO = await processDTOLink(
    response,
    OUTBOX_ACTIONS.CREATE_LINK,
    response.id,
    uploadedImageUrl,
  );

  // For simplicity and centralized, lets create the idempotency key at this level
  const idempotencyBase64 = generateIdempotencyKey(
    linkDTO.id,
    linkDTO.createdAt ?? new Date(),
  );

  try {
    waitUntil(
      Promise.all([
        // record link in Redis
        redis.hset(link.domain.toLowerCase(), {
          [link.key.toLowerCase()]: JSON.stringify(
            await formatRedisLink(response),
          ),
        }),
        // if proxy image is set, upload image to R2 and update the link with the uploaded image URL
        ...(proxy && image && !isStored(image)
          ? [
              // upload image to R2
              storage.upload(`images/${response.id}`, image, {
                width: 1200,
                height: 630,
              }),
              // update the null image we set earlier to the uploaded image URL
              prisma.link.update({
                where: {
                  id: response.id,
                },
                data: {
                  image: uploadedImageUrl,
                },
              }),
              prisma.webhookOutbox.create({
                data: {
                  action: OUTBOX_ACTIONS.CREATE_LINK,
                  host: process.env.NEXT_PUBLIC_APP_DOMAIN || "go.gov.my",
                  payload: JSON.stringify(linkDTO),
                  headers: idempotencyBase64,
                  // partitionId: 0, // For now lets use the default partition id 0
                },
              }),
            ]
          : [
              prisma.webhookOutbox.create({
                data: {
                  action: OUTBOX_ACTIONS.CREATE_LINK,
                  host: process.env.NEXT_PUBLIC_APP_DOMAIN || "go.gov.my",
                  payload: JSON.stringify(linkDTO),
                  headers: idempotencyBase64,
                  // partitionId: 0, // For now lets use the default partition id 0
                },
              }),
              addToHistory({
                ...response,
                type: "create",
                image: uploadedImageUrl,
                linkId: response.id,
                comittedByUserId: sessionUserId,
                timestamp: response.createdAt,
              }),
            ]),
        // increment link usage count
        link.projectId &&
          prisma.project.update({
            where: {
              id: link.projectId,
            },
            data: {
              linksUsage: {
                increment: 1,
              },
            },
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
      logtime: new Date().toISOString(),
    });

    return {
      ...transformLink(response),
      // optimistically set the image URL to the uploaded image URL
      image:
        proxy && image && !isStored(image) ? uploadedImageUrl : response.image,
    };
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
