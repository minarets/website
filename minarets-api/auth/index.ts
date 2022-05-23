import { createHash } from 'crypto';

import Redis from 'ioredis';
import type { Account } from 'next-auth';
import type { Adapter, AdapterUser, AdapterSession, VerificationToken } from 'next-auth/adapters';
import { v4 as uuid } from 'uuid';

import { Minarets } from '../minarets';
import type { User } from '../minarets/types';

interface IWithRedisClient {
  redisClient: Redis;
}

declare const global: IWithRedisClient;

function getGravatarImageUrl(email: string): string {
  const hash = createHash('md5')
    .update(email || 'invalid@example.com')
    .digest('hex');

  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
}

function asAdapterUser(user: User): AdapterUser {
  const image = user.image || getGravatarImageUrl(user.email);
  return {
    ...user,
    id: `${user.id}`,
    image,
    emailVerified: null,
  };
}

export default function MinaretsAdapter(): Adapter {
  const oneHourAsMilliseconds = 60 * 60 * 1000;
  const oneDayAsMilliseconds = 24 * oneHourAsMilliseconds;
  const thirtyDaysAsMilliseconds = 30 * oneDayAsMilliseconds;

  if (!global.redisClient) {
    console.log('Instantiating new redis client');
    global.redisClient = new Redis(process.env.REDIS_URL || '');
  }

  const redisClient = global.redisClient;

  return {
    async createUser(profile: Omit<AdapterUser, 'id'>): Promise<AdapterUser> {
      const api = new Minarets();
      const user = await api.users.createUser(profile);

      return asAdapterUser(user);
    },
    async getUser(id: string): Promise<AdapterUser | null> {
      const api = new Minarets();
      const user = await api.users.getUser(id);

      if (user) {
        return asAdapterUser(user);
      }

      return null;
    },
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const api = new Minarets();
      const user = await api.users.getUserByEmail(email);

      if (user) {
        return asAdapterUser(user);
      }

      return null;
    },
    async getUserByAccount({ provider, providerAccountId }: Pick<Account, 'provider' | 'providerAccountId'>): Promise<AdapterUser | null> {
      const api = new Minarets();
      const user = await api.users.getUserByProvider(provider, providerAccountId);
      if (user) {
        return asAdapterUser(user);
      }

      return null;
    },
    async updateUser(request: Partial<AdapterUser>): Promise<AdapterUser> {
      if (!request.id) {
        throw new Error('User id is required.');
      }

      const api = new Minarets();
      const user = await api.users.setEmailVerified({
        id: request.id,
        emailVerified: request.emailVerified || new Date(),
      });

      return asAdapterUser(user);
    },
    async linkAccount(account: Account): Promise<void> {
      const api = new Minarets();
      await api.users.linkUserWithProvider({
        id: account.userId,
        providerId: account.provider,
        providerAccountId: account.providerAccountId,
      });
    },
    async createSession(session: Omit<AdapterSession, 'id'>): Promise<AdapterSession> {
      const expires = new Date();
      expires.setTime(expires.getTime() + thirtyDaysAsMilliseconds);

      const adapterSession: AdapterSession = {
        id: uuid(),
        ...session,
        expires,
      };

      await redisClient.set(`s_${adapterSession.sessionToken}`, JSON.stringify(adapterSession), 'PX', thirtyDaysAsMilliseconds);
      return adapterSession;
    },
    async getSessionAndUser(sessionToken: string): Promise<{
      session: AdapterSession;
      user: AdapterUser;
    } | null> {
      const value = await redisClient.get(`s_${sessionToken}`);
      if (value) {
        const session = JSON.parse(value) as AdapterSession;
        const user = await this.getUser(session.userId);

        if (user) {
          return {
            session,
            user,
          };
        }
      }

      return null;
    },
    async updateSession({ sessionToken }: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>): Promise<AdapterSession | null | undefined> {
      const value = await redisClient.get(`s_${sessionToken}`);

      if (value) {
        const session = JSON.parse(value) as AdapterSession;

        // Only update session if last update was over an hour ago, to prevent thrashing session db
        const lastExpiration = session.expires;
        lastExpiration.setTime(lastExpiration.getTime() + oneHourAsMilliseconds);

        if (lastExpiration > new Date()) {
          return session;
        }

        // Set new expiration for session
        session.expires = new Date();
        session.expires.setTime(session.expires.getTime() + thirtyDaysAsMilliseconds);

        await redisClient.set(`s_${session.sessionToken}`, JSON.stringify(session), 'PX', thirtyDaysAsMilliseconds);

        return session;
      }

      return null;
    },
    async deleteSession(sessionToken: string): Promise<void> {
      await redisClient.del(`s_${sessionToken}`);
    },
    async createVerificationToken(verificationToken: VerificationToken): Promise<VerificationToken> {
      const hashedToken = createHash('sha256').update(`${verificationToken.token}`).digest('hex');
      const key = `vr_${verificationToken.identifier}${hashedToken}`;

      await redisClient.set(key, JSON.stringify(verificationToken), 'PX', oneHourAsMilliseconds);

      return verificationToken;
    },
    async useVerificationToken({ identifier, token }: { identifier: string; token: string }): Promise<VerificationToken | null> {
      const hashedToken = createHash('sha256').update(`${token}`).digest('hex');
      const key = `vr_${identifier}${hashedToken}`;

      const value = await redisClient.get(key);
      if (value) {
        await redisClient.del(key);
        return JSON.parse(value) as VerificationToken;
      }

      return null;
    },
  };
}
