import { ApiBase } from './apiBase';
import type { User } from './types';

export interface ICreateUserRequest {
  name?: string;
  email: null | string;
  image?: null | string;
}

interface ISetEmailVerifiedRequest {
  id: number | string;
  emailVerified: Date;
}

interface ILinkUserWithProviderRequest {
  id: number | string;
  providerId: string;
  providerAccountId: string;
}

export class Users extends ApiBase {
  public async getUser(id: number | string): Promise<User | null> {
    try {
      const response = await this.get(`${this.apiUrl}/api/users/${id}`);

      return (await response.json()) as User;
    } catch (ex) {
      return null;
    }
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    try {
      const query = this.queryParams({
        email,
      });
      const response = await this.get(`${this.apiUrl}/api/users/findByEmail`, { query });

      return (await response.json()) as User;
    } catch (ex) {
      return null;
    }
  }

  public async getUserByProvider(providerId: string, providerAccountId: string): Promise<User | null> {
    try {
      const query = this.queryParams({
        providerId,
        providerAccountId,
      });
      const response = await this.get(`${this.apiUrl}/api/users/findByProvider`, { query });

      return (await response.json()) as User;
    } catch (ex) {
      return null;
    }
  }

  public async createUser(request: ICreateUserRequest): Promise<User> {
    const response = await this.post(`${this.apiUrl}/api/users/create`, {
      body: JSON.stringify(request),
    });

    return (await response.json()) as User;
  }

  public async setEmailVerified(request: ISetEmailVerifiedRequest): Promise<User> {
    const response = await this.post(`${this.apiUrl}/api/users/${request.id}/setEmailVerified`, {
      body: JSON.stringify(request),
    });

    return (await response.json()) as User;
  }

  public async linkUserWithProvider(request: ILinkUserWithProviderRequest): Promise<User> {
    const response = await this.post(`${this.apiUrl}/api/users/${request.id}/linkWithProvider`, {
      body: JSON.stringify(request),
    });

    return (await response.json()) as User;
  }
}
