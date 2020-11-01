import { createHash } from 'crypto';

import Redis from 'ioredis';
import type { AppOptions } from 'next-auth';
import type { SessionProvider } from 'next-auth/client';
import { v4 as uuid } from 'uuid';

import type { BasicUser } from '../minarets/types/BasicUser';
import type { BasicUserWithToken } from '../minarets/types/BasicUserWithToken';
import type { User } from '../minarets/types/User';
import { Users } from '../minarets/users';

import type { ISession } from './ISession';
import type { IVerificationRequest } from './IVerificationRequest';

interface ISendVerificationRequestParams {
  identifier: string;
  url: string;
  token: string;
  baseUrl: string;
  provider: SessionProvider;
}

type EmailSessionProvider = SessionProvider & {
  sendVerificationRequest: (params: ISendVerificationRequestParams) => Promise<void>;
  maxAge: number | undefined;
};

interface IGetAdapterResult {
  createUser(profile: ICreateUserParams): Promise<BasicUserWithToken>;
  getUser(id: number): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  getUserByProviderAccountId(providerId: string, providerAccountId: string): Promise<User>;
  updateUser(profile: BasicUser): Promise<User>;
  linkAccount(userId: string, providerId: string, providerType: string, providerAccountId: string, refreshToken: string, accessToken: string, accessTokenExpires: number): Promise<void>;
  createSession(user: Pick<BasicUser, 'id'>): Promise<ISession>;
  getSession(sessionToken: string): Promise<ISession | null>;
  updateSession(session: ISession, force: boolean): Promise<ISession>;
  deleteSession(sessionToken: string): Promise<void>;
  createVerificationRequest?(identifier: string, url: string, token: string, secret: string, provider: EmailSessionProvider, options: AppOptions): Promise<IVerificationRequest>;
  getVerificationRequest?(identifier: string, verificationToken: string, secret: string, provider: SessionProvider): Promise<IVerificationRequest | null>;
  deleteVerificationRequest?(identifier: string, verificationToken: string, secret: string, provider: SessionProvider): Promise<void>;
}

interface ICreateUserParams {
  name: string;
  email: string;
  image: string;
}

export default () => {
  function getAdapter({ baseUrl }: AppOptions): IGetAdapterResult {
    const redisClient = new Redis(process.env.REDIS_URL);
    const oneHourAsMilliseconds = 60 * 60 * 1000;
    const oneDayAsMilliseconds = 24 * oneHourAsMilliseconds;
    const thirtyDaysAsMilliseconds = 30 * oneDayAsMilliseconds;

    async function createUser(params: ICreateUserParams): Promise<BasicUserWithToken> {
      const usersApi = new Users();
      // TODO: Need to make a new api to register users... Also, check that next-auth will try logging in before creating
      // TODO: Add image to user object
      return usersApi.createUser({
        username: params.email.substr(0, params.email.indexOf('@')),
        email: params.email,
        password: '',
      });
    }

    async function getUser(id: number): Promise<User> {
      const usersApi = new Users();
      return usersApi.getUser(id);
    }

    async function getUserByEmail(email: string): Promise<User> {
      const usersApi = new Users();
      return usersApi.getUserByEmail(email);
    }

    async function getUserByProviderAccountId(providerId: string, providerAccountId: string): Promise<User> {
      const usersApi = new Users();
      return usersApi.getUserByProviderAccount(providerId, providerAccountId);
    }

    async function updateUser(user: BasicUser): Promise<User> {
      const usersApi = new Users();
      return usersApi.updateUser({
        userId: user.id,
        name: user.name,
      });
    }

    async function linkAccount(userId, providerId, providerType, providerAccountId, refreshToken, accessToken, accessTokenExpires): Promise<void> {
      const usersApi = new Users();
      await usersApi.linkUserWithProviderAccount({
        userId,
        providerId,
        providerAccountId,
      });
    }

    async function createSession(user: Pick<BasicUser, 'id'>): Promise<ISession> {
      const expires = new Date();
      expires.setTime(expires.getTime() + thirtyDaysAsMilliseconds);

      const session: ISession = {
        userId: user.id,
        expires,
        sessionToken: uuid(),
        accessToken: uuid(),
      };

      await redisClient.set(`s_${session.sessionToken}`, JSON.stringify(session), 'PX', thirtyDaysAsMilliseconds);
      return session;
    }

    async function getSession(sessionToken: string): Promise<ISession | null> {
      const value = await redisClient.get(`s_${sessionToken}`);
      if (value) {
        return JSON.parse(value) as ISession;
      }

      return null;
    }

    async function updateSession(session: ISession, force: boolean): Promise<ISession> {
      // Only update session if last update was over an hour ago, to prevent thrashing session db
      const lastExpiration = new Date(session.expires);
      lastExpiration.setTime(lastExpiration.getTime() + oneHourAsMilliseconds);

      if (!force && lastExpiration > new Date()) {
        return session;
      }

      const expires = new Date();
      expires.setTime(expires.getTime() + thirtyDaysAsMilliseconds);

      await redisClient.set(`s_${session.sessionToken}`, JSON.stringify(session), 'PX', thirtyDaysAsMilliseconds);

      return {
        ...session,
        expires,
      };
    }

    async function deleteSession(sessionToken: string): Promise<void> {
      await redisClient.del(`s_${sessionToken}`);
    }

    async function createVerificationRequest(identifier: string, url: string, token: string, secret: string, provider: EmailSessionProvider): Promise<IVerificationRequest> {
      const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
      const key = `vr_${identifier}${hashedToken}`;
      const { sendVerificationRequest, maxAge } = provider;

      const expirationInMilliseconds = maxAge ? maxAge * 1000 : oneHourAsMilliseconds;

      const expires = new Date();
      expires.setTime(expires.getTime() + expirationInMilliseconds);

      const verificationRequest: IVerificationRequest = {
        identifier,
        token: hashedToken,
        expires,
      };

      await redisClient.set(key, JSON.stringify(verificationRequest), 'PX', oneHourAsMilliseconds);

      await sendVerificationRequest({ identifier, url, token, baseUrl, provider });

      return verificationRequest;
    }

    async function getVerificationRequest(identifier: string, token: string, secret: string): Promise<IVerificationRequest | null> {
      const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
      const key = `vr_${identifier}${hashedToken}`;

      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value) as IVerificationRequest;
      }

      return null;
    }

    async function deleteVerificationRequest(identifier: string, token: string, secret: string): Promise<void> {
      const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
      const key = `vr_${identifier}${hashedToken}`;
      await redisClient.del(key);
    }

    return {
      createUser,
      getUser,
      getUserByEmail,
      getUserByProviderAccountId,
      updateUser,
      linkAccount,
      createSession,
      getSession,
      updateSession,
      deleteSession,
      createVerificationRequest,
      getVerificationRequest,
      deleteVerificationRequest,
    };
  }

  return {
    getAdapter,
  };
};
