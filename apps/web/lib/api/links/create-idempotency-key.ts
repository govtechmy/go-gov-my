// Function to generate Idempotent key into Base64
export default function generateIdempotencyKey(
  outboxId: string,
  createdAt: Date,
) {
  const key = {
    timestamp: createdAt.toISOString(),
    id: outboxId,
  };
  return Buffer.from(JSON.stringify(key)).toString("base64");
}
