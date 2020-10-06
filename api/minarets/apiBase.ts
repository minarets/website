import fetch from 'cross-fetch';
import { URL } from 'url';
import { ErrorWithResponse } from './types/ErrorWithResponse';

interface IGetParams {
  query: Record<string, unknown>;
}

function convertToBase64(str: string): string {
  try {
    return btoa(str);
  } catch {
    return Buffer.from(str).toString('base64');
  }
}

export abstract class ApiBase {
  protected defaultHeaders = {
    Authorization: `Basic ${convertToBase64(`${process.env.MINARETS_API_TOKEN || ''}`)}`,
    'Content-Type': 'application/json',
    'X-ApiKey': process.env.MINARETS_API_KEY || '',
  };

  protected async get(url: string, { query }: IGetParams = { query: {} }): Promise<Response> {
    const urlString = new URL(url);
    for (const [key, value] of Object.entries(query)) {
      if (value === null || value === '' || value === undefined) {
        continue;
      }

      if (value instanceof Date) {
        urlString.searchParams.set(key, value.toISOString());
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        urlString.searchParams.set(key, `${value}`);
      }
    }

    const response = await fetch(urlString.href, {
      method: 'GET',
      headers: new Headers(this.defaultHeaders),
    });

    if (response.ok) {
      return response;
    }

    const error: ErrorWithResponse = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}
