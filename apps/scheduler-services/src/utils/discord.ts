import { Config } from '../types';
import fetch from 'node-fetch';

export class DiscordNotifier {
  constructor(
    private webhookUrl: string,
    private threadId?: string
  ) {}

  async notify(message: {
    title: string;
    description: string;
    status: 'success' | 'error';
    data?: any;
  }) {
    const color = message.status === 'success' ? 0x00ff00 : 0xff0000;

    const embed = {
      title: message.title,
      description: message.description,
      color: color,
      timestamp: new Date().toISOString(),
      fields: message.data
        ? [
            {
              name: 'Details',
              value: '```json\n' + JSON.stringify(message.data, null, 2) + '\n```',
            },
          ]
        : [],
    };

    const webhookUrlWithThread = this.threadId
      ? `${this.webhookUrl}?thread_id=${this.threadId}`
      : this.webhookUrl;

    try {
      await fetch(webhookUrlWithThread, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embeds: [embed] }),
      });
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }
}
