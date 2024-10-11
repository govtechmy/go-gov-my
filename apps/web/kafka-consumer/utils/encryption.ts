import { DecryptCommand, EncryptCommand, KMSClient } from '@aws-sdk/client-kms';

const kms = new KMSClient();

const ENCRYPTION_KEY_ID = process.env.ENCRYPTION_KEY_ID;

// Matches {{PASSWORD}}, {{API_KEY}}, {{SECRET_VALUE}}
const SECRET_PLACEHOLDER_PATTERN = /\{\{[A-Z_]+\}\}/g;

/**
 * Encrypts a record of secret values using AWS KMS.
 *
 * @param values A record where keys are placeholders and values are the corresponding secret values to be encrypted.
 * @returns Base-64 encoded encrypted secrets
 *
 * @example
 * const secrets = {
 *   "{{PASSWORD}}": "mySecretPassword123",
 *   "{{API_KEY}}": "abcdef1234567890"
 * };
 * const encryptedSecrets = await encryptOutboxSecrets(secrets);
 * console.log(encryptedSecrets); // Outputs: base-64 encoded encrypted secrets
 */
export async function encryptOutboxSecrets(
  values: Record<string, string>,
): Promise<string> {
  const result = await kms.send(
    new EncryptCommand({
      KeyId: ENCRYPTION_KEY_ID,
      Plaintext: Buffer.from(JSON.stringify(values)),
    }),
  );
  if (!result.CiphertextBlob) {
    throw Error('AWS KMS did not return encrypt result');
  }
  return Buffer.from(result.CiphertextBlob).toString('base64');
}

async function decryptOutboxSecrets(
  ciphertext: string,
): Promise<Record<string, string>> {
  const result = await kms.send(
    new DecryptCommand({
      KeyId: ENCRYPTION_KEY_ID,
      CiphertextBlob: Buffer.from(ciphertext, 'base64'),
    }),
  );
  if (!result.Plaintext) {
    throw Error('AWS KMS did not return decrypt result');
  }
  return JSON.parse(Buffer.from(result.Plaintext).toString('utf8'));
}

function interpolateSecrets(
  payload: string,
  secrets: Record<string, string>,
): string {
  return payload.replaceAll(SECRET_PLACEHOLDER_PATTERN, (match) => {
    return secrets[match] || match;
  });
}

/**
 * Deciphers the outbox payload by decrypting the encrypted secrets and interpolating them into the payload.
 *
 * @param params.payload The original payload containing placeholders for secrets.
 * @param params.encryptedSecrets Base64-encoded encrypted secrets.
 * @returns The final payload with secrets interpolated.
 *
 * @example
 * const result = await decipherOutboxPayload({
 *   payload: 'Hello {{SECRET}}',
 *   encryptedSecrets: 'base64EncodedEncryptedSecrets'
 * });
 * console.log(result); // Outputs: 'Hello world' (assuming 'world' was the decrypted secret)
 */
export async function decipherOutboxPayload({
  payload,
  encryptedSecrets,
}: {
  payload: string;
  encryptedSecrets: string;
}) {
  const decryptedSecrets = await decryptOutboxSecrets(encryptedSecrets);
  const finalPayload = interpolateSecrets(payload, decryptedSecrets);
  return finalPayload;
}
