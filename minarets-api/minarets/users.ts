import { ApiBase } from './apiBase';
import type { User } from './types';

export interface ICreateUserRequest {
  name?: string | null;
  email?: string | null;
  image?: string | null;
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
  public getUser(id: number | string): Promise<User> | null {
    try {
      return this.get<User>(`${this.apiUrl}/api/users/${id}`);
    } catch (ex) {
      return null;
    }
  }

  public getUserByEmail(email: string): Promise<User> | null {
    try {
      const query = this.queryParams({
        email,
      });
      return this.get<User>(`${this.apiUrl}/api/users/findByEmail`, { query });
    } catch (ex) {
      return null;
    }
  }

  public getUserByProvider(providerId: string, providerAccountId: string): Promise<User> | null {
    try {
      const query = this.queryParams({
        providerId,
        providerAccountId,
      });
      return this.get<User>(`${this.apiUrl}/api/users/findByProvider`, { query });
    } catch (ex) {
      return null;
    }
  }

  public createUser(request: ICreateUserRequest): Promise<User> {
    return this.post<User>(`${this.apiUrl}/api/users/create`, request);
  }

  public setEmailVerified(request: ISetEmailVerifiedRequest): Promise<User> {
    return this.post<User>(`${this.apiUrl}/api/users/${request.id}/setEmailVerified`, request);
  }

  public linkUserWithProvider(request: ILinkUserWithProviderRequest): Promise<User> {
    return this.post<User>(`${this.apiUrl}/api/users/${request.id}/linkWithProvider`, request);
  }
}
