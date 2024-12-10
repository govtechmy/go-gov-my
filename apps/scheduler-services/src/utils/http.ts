import { Config } from '../types';
import fetch, { RequestInit } from 'node-fetch';

export class HttpClient {
  constructor(private config: Config) {}

  async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.webBase}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      'API-Key': this.config.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch ${url}: ${errorMessage}`);
    }
  }
}
