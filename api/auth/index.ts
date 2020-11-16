import { createHash } from 'crypto';

import Redis from 'ioredis';
import type { AppOptions } from 'next-auth';
import type { Adapter, AdapterInstance } from 'next-auth/adapters';
import type { SessionProvider } from 'next-auth/client';
import { v4 as uuid } from 'uuid';

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

interface IProfile {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface ICreateUserParams extends IProfile {
  emailVerified?: Date;
}

interface IUpdateUserParams extends User {
  emailVerified: Date;
}

// interface IGetAdapterResult {
//   createUser(profile: ICreateUserParams): Promise<User>;
//   getUser(id: number): Promise<User | null>;
//   getUserByEmail(email: string): Promise<User | null>;
//   getUserByProviderAccountId(providerId: string, providerAccountId: string): Promise<User | null>;
//   updateUser(profile: IUpdateUserParams): Promise<User>;
//   linkAccount(userId: number, providerId: string, providerType: string, providerAccountId: string): Promise<void>;
//   createSession(user: Pick<BasicUser, 'id'>): Promise<ISession>;
//   getSession(sessionToken: string): Promise<ISession | null>;
//   updateSession(session: ISession, force: boolean): Promise<ISession>;
//   deleteSession(sessionToken: string): Promise<void>;
//   createVerificationRequest?(identifier: string, url: string, token: string, secret: string, provider: EmailSessionProvider, options: AppOptions): Promise<IVerificationRequest>;
//   getVerificationRequest?(identifier: string, verificationToken: string, secret: string, provider: SessionProvider): Promise<IVerificationRequest | null>;
//   deleteVerificationRequest?(identifier: string, verificationToken: string, secret: string, provider: SessionProvider): Promise<void>;
// }

export default (): Adapter<User, IProfile, ISession, IVerificationRequest> => {
  function getAdapter({ baseUrl }: AppOptions): Promise<AdapterInstance<User, IProfile, ISession, IVerificationRequest>> {
    const redisClient = new Redis(process.env.REDIS_URL);
    const oneHourAsMilliseconds = 60 * 60 * 1000;
    const oneDayAsMilliseconds = 24 * oneHourAsMilliseconds;
    const thirtyDaysAsMilliseconds = 30 * oneDayAsMilliseconds;

    function setFallbackImage(user: User | null): User | null {
      if (!user) {
        return user;
      }

      if (user.image) {
        return user;
      }

      const hash = createHash('md5')
        .update(user.email || 'invalid@example.com')
        .digest('hex');

      return {
        ...user,
        image: `https://www.gravatar.com/avatar/${hash}?d=identicon`,
      };
    }

    async function createUser(profile: ICreateUserParams): Promise<User> {
      const usersApi = new Users();
      return usersApi.createUser(profile);
    }

    async function getUser(id: string): Promise<User | null> {
      const usersApi = new Users();
      const user = await usersApi.getUser(id);
      return setFallbackImage(user);
    }

    async function getUserByEmail(email: string): Promise<User | null> {
      const usersApi = new Users();
      const user = await usersApi.getUserByEmail(email);
      return setFallbackImage(user);
    }

    async function getUserByProviderAccountId(providerId: string, providerAccountId: string): Promise<User | null> {
      const usersApi = new Users();
      const user = await usersApi.getUserByProvider(providerId, providerAccountId);
      return setFallbackImage(user);
    }

    async function updateUser(request: IUpdateUserParams): Promise<User> {
      const usersApi = new Users();
      return usersApi.setEmailVerified({
        id: request.id,
        emailVerified: request.emailVerified,
      });
    }

    async function linkAccount(userId: string, providerId: string, _providerType: string, providerAccountId: string): Promise<void> {
      const usersApi = new Users();
      await usersApi.linkUserWithProvider({
        id: userId,
        providerId,
        providerAccountId,
      });
    }

    async function createSession(user: User): Promise<ISession> {
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

    return Promise.resolve({
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
    });
  }

  return {
    getAdapter,
  };
};
