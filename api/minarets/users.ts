import { ApiBase } from './apiBase';
import type { User } from './types';

export interface ICreateUserRequest {
  name?: string;
  email: string | null;
  image?: string | null;
}

interface ISetEmailVerifiedRequest {
  id: string | number;
  emailVerified: Date;
}

interface ILinkUserWithProviderRequest {
  id: string | number;
  providerId: string;
  providerAccountId: string;
}

export class Users extends ApiBase {
  public async getUser(id: string | number): Promise<User | null> {
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
