import { URL } from 'url';

import type { AxiosInstance } from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';

interface IGetParams {
  query: Record<string, string>;
}

export function convertToBase64(str: string): string {
  try {
    return btoa(str);
  } catch {
    return Buffer.from(str).toString('base64');
  }
}

export abstract class ApiBase {
  private apiKey: string;

  private apiToken: string;

  protected apiUrl: string;

  protected client: AxiosInstance;

  public constructor(apiKey: string, apiToken: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiToken = apiToken;
    this.apiUrl = apiUrl;

    this.client = axios.create({
      headers: {
        Authorization: `Basic ${convertToBase64(`${this.apiToken}`)}`,
        'Content-Type': 'application/json',
        'X-ApiKey': this.apiKey,
      },
    });
    axiosRetry(this.client, {
      retryDelay: (retryCount) => axiosRetry.exponentialDelay(retryCount),
    });
  }

  protected queryParams<T extends { [K in keyof T]: T[K] }>(input: T): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value === null || value === '' || value === undefined) {
        continue;
      }

      if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        result[key] = `${value}`;
      }
    }

    return result;
  }

  protected async get<TResponse>(url: string, { query }: IGetParams = { query: {} }): Promise<TResponse> {
    const urlString = new URL(url);
    for (const [key, value] of Object.entries(query)) {
      urlString.searchParams.set(key, value);
    }

    const response = await this.client.get<TResponse>(urlString.href);
    return response.data;
  }

  protected async post<TResponse, D = unknown>(url: string, data?: D): Promise<TResponse> {
    const response = await this.client.post<TResponse>(url, data);
    return response.data;
  }
}
