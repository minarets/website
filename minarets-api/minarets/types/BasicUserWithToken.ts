import type { BasicUser } from './BasicUser';

export interface BasicUserWithToken extends BasicUser {
  token: string;
}
