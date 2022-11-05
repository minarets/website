import type { Session } from 'next-auth';

export interface SessionWithUserToken extends Session {
  userToken?: string;
}
