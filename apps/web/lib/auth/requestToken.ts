import { createHash, randomBytes } from 'crypto';

const SECRET_KEY = process.env.API_SECRET_KEY!;
const TOKEN_EXPIRY = 300; // seconds

export function generateRequestToken() {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = randomBytes(16).toString('hex');
  const payload = `${timestamp}:${nonce}`;
  const signature = createHash('sha256')
    .update(`${payload}:${SECRET_KEY}`)
    .digest('hex');

  return { token: `${payload}:${signature}`, timestamp };
}

export function verifyRequestToken(token: string): boolean {
  try {
    const [timestamp, nonce, signature] = token.split(':');
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    if (currentTime - parseInt(timestamp) > TOKEN_EXPIRY) {
      return false;
    }

    // Verify signature
    const expectedSignature = createHash('sha256')
      .update(`${timestamp}:${nonce}:${SECRET_KEY}`)
      .digest('hex');

    return signature === expectedSignature;
  } catch {
    return false;
  }
}
