import { Kafka } from "kafkajs";

const OUTBOX_TOPIC = "ps-postgres.public.WebhookOutbox";
const REDIRECT_SERVER_BASE_URL = "http://localhost:3000";

async function main() {
  const kafka = new Kafka({
    clientId: "go.gov.my",
    brokers: ["localhost:9092"],
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

  await consumer.run({
    autoCommitInterval: 1000, // 1 second
    eachMessage: async ({ message }) => {
      if (!message.value) {
        return;
      }

      // expect a debezium event payload
      const { payload: debeziumPayload } = JSON.parse(
        message.value.toString("utf8"),
      );

      if (debeziumPayload.op === "c") {
        // debeziumPayload.after is the newly inserted row in WebhookOutbox table
        const { payload, action } = debeziumPayload.after;

        switch (action) {
          case "create":
            await fetch(`${REDIRECT_SERVER_BASE_URL}/links`, {
              method: "POST",
              body: payload,
            });
            break;
          case "update":
            await fetch(`${REDIRECT_SERVER_BASE_URL}/links`, {
              method: "POST",
              body: payload,
            });
            break;
          case "delete":
            const { id: linkId } = JSON.parse(payload);
            await fetch(`${REDIRECT_SERVER_BASE_URL}/links/${linkId}`, {
              method: "DELETE",
            });
            break;
        }

        // TODO: Delete the row from WebhookOutbox table
      }
    },
  });
}

main();
