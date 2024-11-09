import { generateRequestToken } from '@/lib/auth/requestToken';

export const checkLink = async (url: string) => {
  const { token } = generateRequestToken();

  const response = await fetch('/api/link-checker', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-request-token': token,
    },
    body: JSON.stringify({ url }),
  });
  return response.json();
};
