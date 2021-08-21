import { createHash } from 'crypto';

import Redis from 'ioredis';
import type { Profile } from 'next-auth';
import type { AdapterInstance, Adapter } from 'next-auth/adapters';
import type { AppOptions } from 'next-auth/internals';
import type { EmailConfig } from 'next-auth/providers';
import { v4 as uuid } from 'uuid';

import { Minarets } from '../minarets';
import type { User } from '../minarets/types';

interface VerificationRequest {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
}

interface MinaretsSession {
  userId: number;
  expires: string;
  sessionToken: string;
  accessToken: string;
}

interface ICreateUserParams extends Profile {
  emailVerified?: Date;
}

interface IUpdateUserParams extends User {
  emailVerified: Date;
}

interface IWithRedisClient {
  redisClient: Redis.Redis;
}

declare const global: IWithRedisClient;

export default (): ReturnType<Adapter<unknown, unknown, User, Profile, MinaretsSession>> => {
  if (!global.redisClient) {
    console.log('Instantiating new redis client');
    global.redisClient = new Redis(process.env.REDIS_URL);
  }

  const redisClient = global.redisClient;

  return {
    getAdapter(appOptions: AppOptions): Promise<AdapterInstance<User, Profile, MinaretsSession>> {
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

      return Promise.resolve({
        displayName: 'MINARETS',

        createUser(profile: ICreateUserParams): Promise<User> {
          const api = new Minarets();
          return api.users.createUser(profile);
        },

        async getUser(id: string): Promise<User | null> {
          const api = new Minarets();
          const user = await api.users.getUser(id);
          return setFallbackImage(user);
        },

        async getUserByEmail(email: string): Promise<User | null> {
          const api = new Minarets();
          const user = await api.users.getUserByEmail(email);
          return setFallbackImage(user);
        },

        async getUserByProviderAccountId(providerId: string, providerAccountId: string): Promise<User | null> {
          const api = new Minarets();
          const user = await api.users.getUserByProvider(providerId, providerAccountId);
          return setFallbackImage(user);
        },

        updateUser(request: IUpdateUserParams): Promise<User> {
          const api = new Minarets();
          return api.users.setEmailVerified({
            id: request.id,
            emailVerified: request.emailVerified,
          });
        },

        async linkAccount(userId: string, providerId: string, _providerType: string, providerAccountId: string): Promise<void> {
          const api = new Minarets();
          await api.users.linkUserWithProvider({
            id: userId,
            providerId,
            providerAccountId,
          });
        },

        async createSession(user: User): Promise<MinaretsSession> {
          const expires = new Date();
          expires.setTime(expires.getTime() + thirtyDaysAsMilliseconds);

          const session: MinaretsSession = {
            userId: user.id,
            expires: expires.toISOString(),
            sessionToken: uuid(),
            accessToken: uuid(),
          };

          await redisClient.set(`s_${session.sessionToken}`, JSON.stringify(session), 'PX', thirtyDaysAsMilliseconds);
          return session;
        },

        async getSession(sessionToken: string): Promise<MinaretsSession | null> {
          const value = await redisClient.get(`s_${sessionToken}`);
          if (value) {
            return JSON.parse(value) as MinaretsSession;
          }

          return null;
        },

        async updateSession(session: MinaretsSession, force: boolean): Promise<MinaretsSession> {
          // Only update session if last update was over an hour ago, to prevent thrashing session db
          const lastExpiration = session.expires ? new Date(session.expires) : new Date();
          lastExpiration.setTime(lastExpiration.getTime() + oneHourAsMilliseconds);

          if (!force && lastExpiration > new Date()) {
            return session;
          }

          const expires = new Date();
          expires.setTime(expires.getTime() + thirtyDaysAsMilliseconds);

          await redisClient.set(`s_${session.sessionToken}`, JSON.stringify(session), 'PX', thirtyDaysAsMilliseconds);

          return {
            ...session,
            expires: expires.toISOString(),
          };
        },

        async deleteSession(sessionToken: string): Promise<void> {
          await redisClient.del(`s_${sessionToken}`);
        },

        async createVerificationRequest(identifier: string, url: string, token: string, secret: string, provider: EmailConfig): Promise<void> {
          const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
          const key = `vr_${identifier}${hashedToken}`;
          const { sendVerificationRequest, maxAge } = provider;

          const expirationInMilliseconds = maxAge ? maxAge * 1000 : oneHourAsMilliseconds;

          const expires = new Date();
          expires.setTime(expires.getTime() + expirationInMilliseconds);

          const verificationRequest: VerificationRequest = {
            id: uuid(), // No idea why this is needed...
            identifier,
            token: hashedToken,
            expires,
          };

          await redisClient.set(key, JSON.stringify(verificationRequest), 'PX', oneHourAsMilliseconds);

          if (sendVerificationRequest) {
            await sendVerificationRequest({
              baseUrl: appOptions.baseUrl || '',
              identifier,
              url,
              token,
              provider,
            });
          }
        },

        async getVerificationRequest(identifier: string, token: string, secret: string): Promise<VerificationRequest | null> {
          const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
          const key = `vr_${identifier}${hashedToken}`;

          const value = await redisClient.get(key);
          if (value) {
            return JSON.parse(value) as VerificationRequest;
          }

          return null;
        },

        async deleteVerificationRequest(identifier: string, token: string, secret: string): Promise<void> {
          const hashedToken = createHash('sha256').update(`${token}${secret}`).digest('hex');
          const key = `vr_${identifier}${hashedToken}`;
          await redisClient.del(key);
        },
      });
    },
  };
};
