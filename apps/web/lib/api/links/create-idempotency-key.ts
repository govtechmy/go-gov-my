// Function to generate Idempotent key into Base64
export default function generateIdempotencyKey(
  outboxId: string,
  createdAt: Date,
) {
  const key = {
    timestamp: createdAt.toISOString(),
    id: outboxId,
  };

  const base64Key = Buffer.from(JSON.stringify(key)).toString("base64");

  return { "X-Idempotency-Key": base64Key, "Content-Type": "application/json" };
}
