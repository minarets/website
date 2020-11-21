import { createHash } from 'crypto';

import Redis from 'ioredis';
import type { AppOptions } from 'next-auth';
import type { Adapter, AdapterInstance, Profile, Session, VerificationRequest } from 'next-auth/adapters';
import type { SessionProvider } from 'next-auth/client';
import { v4 as uuid } from 'uuid';

import { Minarets } from '../minarets';
import type { User } from '../minarets/types';

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

interface ICreateUserParams extends Profile {
  emailVerified?: Date;
}

interface IUpdateUserParams extends User {
  emailVerified: Date;
}

export default (): Adapter<User, Profile, Session, VerificationRequest> => {
  const redisClient = new Redis(process.env.REDIS_URL);

  function getAdapter({ baseUrl }: AppOptions): Promise<AdapterInstance<User, Profile, Session, VerificationRequest>> {
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
      const api = new Minarets();
      return api.users.createUser(profile);
    }

    async function getUser(id: string): Promise<User | null> {
      const api = new Minarets();
      const user = await api.users.getUser(id);
      return setFallbackImage(user);
    }

    async function getUserByEmail(email: string): Promise<User | null> {
      const api = new Minarets();
      const user = await api.users.getUserByEmail(email);
      return setFallbackImage(user);
    }

    async function getUserByProviderAccountId(providerId: string, providerAccountId: string): Promise<User | null> {
      const api = new Minarets();
      const user = await api.users.getUserByProvider(providerId, providerAccountId);
      return setFallbackImage(user);
    }

    async function updateUser(request: IUpdateUserParams): Promise<User> {
      const api = new Minarets();
      return api.users.setEmailVerified({
        id: request.id,
        emailVerified: request.emailVerified,
      });
    }

    async function linkAccount(userId: string, providerId: string, _providerType: string, providerAccountId: string): Promise<void> {
      const api = new Minarets();
      await api.users.linkUserWithProvider({
        id: userId,
        providerId,
        providerAccountId,
      });
    }

    async function createSession(user: User): Promise<Session> {
      const expires = new Date();
      expires.setTime(expires.getTime() + thirtyDaysAsMilliseconds);

      const session: Session = {
        userId: user.id,
        expires,
        sessionToken: uuid(),
        accessToken: uuid(),
      };

      await redisClient.set(`s_${session.sessionToken}`, JSON.stringify(session), 'PX', thirtyDaysAsMilliseconds);
      return session;
    }

    async function getSession(sessionToken: string): Promise<Session | null> {
      const value = await redisClient.get(`s_${sessionToken}`);
      if (value) {
        return JSON.parse(value) as Session;
      }

      return null;
    }

    async function updateSession(session: Session, force: boolean): Promise<Session> {
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

    async function createVerificationRequest(identifier: string, url: string, token: string, secret: string, provider: EmailSessionProvider): Promise<VerificationRequest> {
      const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
      const key = `vr_${identifier}${hashedToken}`;
      const { sendVerificationRequest, maxAge } = provider;

      const expirationInMilliseconds = maxAge ? maxAge * 1000 : oneHourAsMilliseconds;

      const expires = new Date();
      expires.setTime(expires.getTime() + expirationInMilliseconds);

      const verificationRequest: VerificationRequest = {
        identifier,
        token: hashedToken,
        expires,
      };

      await redisClient.set(key, JSON.stringify(verificationRequest), 'PX', oneHourAsMilliseconds);

      await sendVerificationRequest({ identifier, url, token, baseUrl, provider });

      return verificationRequest;
    }

    async function getVerificationRequest(identifier: string, token: string, secret: string): Promise<VerificationRequest | null> {
      const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
      const key = `vr_${identifier}${hashedToken}`;

      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value) as VerificationRequest;
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
