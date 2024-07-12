// Function to generate Idempotent key into Base64
export default function generateIdempotencyKey(id: string, timestamp: Date) {
  const key = {
    timestamp: timestamp.toISOString(),
    id: id,
  };

  const base64Key = Buffer.from(JSON.stringify(key)).toString("base64");

  return { "X-Idempotency-Key": base64Key, "Content-Type": "application/json" };
}
