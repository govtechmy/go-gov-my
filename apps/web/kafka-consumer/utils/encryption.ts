import {
  GenerateDataKeyCommand,
  GenerateRandomCommand,
  KMSClient,
} from "@aws-sdk/client-kms";
import crypto from "node:crypto";

const kms = new KMSClient();

if (!process.env.WRAPPING_KEY_ID) {
  throw Error(`Missing env var "WRAPPING_KEY_ID"`);
}
const WRAPPING_KEY_ID = process.env.WRAPPING_KEY_ID;
const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

type Base64Encoding = string;
type EncryptedMessage = {
  encryptedDataKey: Base64Encoding;
  encryptedData: Base64Encoding;
  initializationVector: Base64Encoding;
  authTag: Base64Encoding;
};

async function generateDataKey(): Promise<{
  encryptedDataKey: Buffer;
  plaintextDataKey: Buffer;
}> {
  const result = await kms.send(
    new GenerateDataKeyCommand({
      KeyId: WRAPPING_KEY_ID,
      KeySpec: "AES_256",
    }),
  );
  if (!result.Plaintext) {
    throw Error("AWS KMS did not return a plaintext data key");
  }
  if (!result.CiphertextBlob) {
    throw Error("AWS KMS did not return an encrypted data key");
  }
  return {
    plaintextDataKey: Buffer.from(result.Plaintext),
    encryptedDataKey: Buffer.from(result.CiphertextBlob),
  };
}

async function generateInitializationVector(numBytes: number): Promise<Buffer> {
  const result = await kms.send(
    new GenerateRandomCommand({
      NumberOfBytes: numBytes,
    }),
  );
  if (!result.Plaintext) {
    throw Error("AWS KMS did not return random bytes");
  }
  return Buffer.from(result.Plaintext);
}

export async function createEncryptedMessage(
  data: Buffer,
): Promise<EncryptedMessage> {
  const { plaintextDataKey, encryptedDataKey } = await generateDataKey();
  const initializationVector = await generateInitializationVector(IV_BYTES);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    plaintextDataKey,
    initializationVector,
  );
  const encryptedData = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedDataKey: encryptedDataKey.toString("base64"),
    encryptedData: encryptedData.toString("base64"),
    initializationVector: initializationVector.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}
