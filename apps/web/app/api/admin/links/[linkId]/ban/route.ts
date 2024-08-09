import { DubApiError } from "@/lib/api/errors";
import generateIdempotencyKey from "@/lib/api/links/create-idempotency-key";
import { withAdmin } from "@/lib/auth";
import { processDTOLink } from "@/lib/dto/link.dto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { waitUntil } from "@vercel/functions";
import {
  OUTBOX_ACTIONS,
  REDIRECT_SERVER_BASE_URL,
} from "kafka-consumer/actions";
import { NextResponse } from "next/server";
import { z } from "zod";

// PUT /api/admin/links/[linkId]/ban – ban or unban a link
export const PUT = withAdmin(async ({ params, req }) => {
  const { linkId } = params;
  if (!linkId) {
    throw new DubApiError({
      code: "bad_request",
      message: "Missing linkId from path params",
    });
  }

  const link = await prisma.link.findUnique({
    where: {
      id: linkId,
    },
  });

  if (!link) {
    return NextResponse.next();
  }

  const { ban } = await z
    .object({
      ban: z.boolean(),
    })
    .parseAsync(await req.json());

  const response = await prisma.link.update({
    where: {
      id: linkId,
    },
    data: {
      banned: ban,
    },
  });

  waitUntil(
    (async () => {
      const linkDTO = await processDTOLink(response);
      const headersJSON = generateIdempotencyKey(
        linkDTO.id,
        response.updatedAt,
      );

      await prisma.webhookOutbox.create({
        data: {
          action: OUTBOX_ACTIONS.UPDATE_LINK,
          host: REDIRECT_SERVER_BASE_URL + "/links",
          payload: linkDTO as unknown as Prisma.InputJsonValue,
          headers: headersJSON,
          partitionKey: linkDTO.slug,
        },
      });
    })(),
  );

  return NextResponse.json(response);
});
