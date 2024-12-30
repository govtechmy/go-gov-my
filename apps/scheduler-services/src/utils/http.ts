import { Config } from '../types';
import fetch, { RequestInit } from 'node-fetch';

export class HttpClient {
  constructor(private config: Config) {}

  async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.webBase}${path}`;

    // Merge default headers with custom headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      console.log(`Making request to ${url} with headers:`, headers);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from ${url}:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      return response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch ${url}: ${errorMessage}`);
    }
  }
}
