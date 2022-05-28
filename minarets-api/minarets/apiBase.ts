import { URL } from 'url';

import setupFetch from '@vercel/fetch';
import type { RequestInit, Response } from 'node-fetch';
import nodeFetch, { Headers } from 'node-fetch';

import type { ErrorWithResponse } from './types';

const fetch = setupFetch({
  Headers,
  default: nodeFetch,
});

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

  protected defaultHeaders: Record<string, string>;

  public constructor(apiKey: string, apiToken: string, apiUrl: string) {
    this.apiKey = apiKey;
    this.apiToken = apiToken;
    this.apiUrl = apiUrl;

    this.defaultHeaders = {
      Authorization: `Basic ${convertToBase64(`${this.apiToken}`)}`,
      'Content-Type': 'application/json',
      'X-ApiKey': this.apiKey,
    };
  }

  protected queryParams<T>(input: T): Record<string, string> {
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

  protected async get(url: string, { query }: IGetParams = { query: {} }): Promise<Response> {
    const urlString = new URL(url);
    for (const [key, value] of Object.entries(query)) {
      urlString.searchParams.set(key, value);
    }

    const response = await fetch(urlString.href, {
      method: 'GET',
      headers: new Headers(this.defaultHeaders),
    });

    if (response.ok) {
      return response;
    }

    let message = response.statusText;
    try {
      const responseBody = (await response.json()) as Record<string, unknown>;
      if (responseBody) {
        message += ` \n${JSON.stringify(responseBody, null, 1)}`;
      }
    } catch (ex) {
      // ignore
    }

    const error: ErrorWithResponse = new Error(message);
    error.response = response;
    throw error;
  }

  protected async post(url: string, { body }: Pick<RequestInit, 'body'>): Promise<Response> {
    const response = await fetch(url, {
      method: 'POST',
      headers: new Headers(this.defaultHeaders),
      body,
    });

    if (response.ok) {
      return response;
    }

    let message = response.statusText;
    try {
      const responseBody = (await response.json()) as Record<string, unknown>;
      if (responseBody) {
        message += ` \n${JSON.stringify(responseBody, null, 1)}`;
      }
    } catch (ex) {
      // ignore
    }

    const error: ErrorWithResponse = new Error(message);
    error.response = response;
    throw error;
  }
}
