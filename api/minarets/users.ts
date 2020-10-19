import { ApiBase } from './apiBase';
import type { BasicUser } from './types/BasicUser';
import type { BasicUserWithToken } from './types/BasicUserWithToken';
import type { User } from './types/User';

export interface ICreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export class Users extends ApiBase {
  public async getUser(id: number): Promise<User> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/users/${id}`);

    return (await response.json()) as User;
  }

  public async getCurrentUser(): Promise<BasicUser> {
    const response = await this.get(`${process.env.MINARETS_API_URL || ''}/api/users/current`);

    return (await response.json()) as BasicUser;
  }

  public async createUser(request: ICreateUserRequest): Promise<BasicUserWithToken> {
    const response = await this.post(`${process.env.MINARETS_API_URL || ''}/api/users/register`, {
      body: JSON.stringify(request),
    });

    return (await response.json()) as BasicUserWithToken;
  }
}
