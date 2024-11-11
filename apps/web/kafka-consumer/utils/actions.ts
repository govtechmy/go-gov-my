export const OUTBOX_ACTIONS = {
  CREATE_LINK: 'POST',
  DELETE_LINK: 'DELETE',
  UPDATE_LINK: 'PATCH',
} as const;

export const REDIRECT_SERVER_BASE_URL = process.env.REDIRECT_SERVER_URL || 'http://localhost:3002';
