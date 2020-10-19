import fetch from 'cross-fetch';

import { ApiBase, convertToBase64 } from './apiBase';
import type { BasicUserWithToken } from './types/BasicUserWithToken';
import type { ErrorWithResponse } from './types/ErrorWithResponse';

interface ILoginRequest {
  username: string;
  password: string;
}

export class Account extends ApiBase {
  public async login(request: ILoginRequest): Promise<BasicUserWithToken> {
    const headers = new Headers(this.defaultHeaders);
    headers.set('Authorization', `Basic ${convertToBase64(`${request.username}:${request.password}`)}`);

    const response = await fetch(`${process.env.MINARETS_API_URL || ''}/api/users/login`, {
      method: 'POST',
      headers,
      body: '',
    });

    if (response.ok) {
      return (await response.json()) as BasicUserWithToken;
    }

    const error: ErrorWithResponse = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}
