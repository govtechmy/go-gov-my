import { prisma } from "@/lib/prisma";
import { Kafka } from "kafkajs";

const OUTBOX_TOPIC =
  process.env.OUTBOX_TOPIC || "ps-postgres.public.WebhookOutbox";
const REDIRECT_SERVER_BASE_URL =
  process.env.REDIRECT_SERVER_URL || "http://localhost:3000";

export const OUTBOX_ACTIONS = {
  CREATE_LINK: "create-link",
  DELETE_LINK: "delete-link",
  UPDATE_LINK: "update-link",
};

async function main() {
  const kafkaBrokerUrl = process.env.KAFKA_BROKER_URL || "localhost:9092";
  const kafka = new Kafka({
    clientId: process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN || "go.gov.my",
    brokers: [kafkaBrokerUrl],
  });

  const consumer = kafka.consumer({
    groupId: "redirect-group",
    minBytes: 10e3, // 10KB
    maxBytes: 10e6, // 10MB
  });

  await consumer.connect();
  await consumer.subscribe({
    topic: OUTBOX_TOPIC,
    fromBeginning: true,
  });

  console.log("Starting kafka consumer...");

  await consumer.run({
    autoCommitInterval: 1000, // 1 second
    eachMessage: async ({ message }) => {
      try {
        if (!message.value) {
          return;
        }

        // expect a debezium event payload
        const { payload: debeziumPayload } = JSON.parse(
          message.value.toString("utf8"),
        );

        if (debeziumPayload.op === "c") {
          // debeziumPayload.after is the newly inserted row in WebhookOutbox table
          const { id: outboxId, payload, action } = debeziumPayload.after;

          console.log(debeziumPayload.after);

          let response: Response;

          switch (action) {
            case OUTBOX_ACTIONS.CREATE_LINK:
              console.log(
                "Sending a request to the redirect server: POST /links",
              );
              response = await fetch(`${REDIRECT_SERVER_BASE_URL}/links`, {
                method: "POST",
                body: payload,
              });
              break;
            case OUTBOX_ACTIONS.UPDATE_LINK:
              console.log(
                "Sending a request to the redirect server: PUT /links",
              );
              response = await fetch(`${REDIRECT_SERVER_BASE_URL}/links`, {
                method: "PUT",
                body: payload,
              });
              break;
            case OUTBOX_ACTIONS.DELETE_LINK:
              const { id: linkId } = JSON.parse(payload);
              console.log(
                `Sending a request to the redirect server: DELETE /links/${linkId}`,
              );
              response = await fetch(
                `${REDIRECT_SERVER_BASE_URL}/links/${linkId}`,
                {
                  method: "DELETE",
                },
              );
              break;
            default:
              console.log(
                `Unhandled outbox action '${action}', ID = ${outboxId}`,
              );
              return;
          }

          if (response.ok) {
            console.log("Response to redirect-server was successful");
            await prisma.webhookOutbox.delete({
              where: { id: outboxId },
            });
            console.log(`WebhookOutbox row with ID ${outboxId} was deleted`);
          } else {
            console.log(
              `Response to redirect-server was unsuccessful, status: ${response.status}, outboxId: ${outboxId}`,
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    },
  });
}

main();
