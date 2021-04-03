import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import type { User as NextAuthUser, NextAuthOptions, Session } from 'next-auth';
import type { NextApiHandler } from 'next-auth/_next';
import type { WithAdditionalParams } from 'next-auth/_utils';
import Providers from 'next-auth/providers';
import type { Providers as ProvidersType } from 'next-auth/providers';

import MinaretsAdapter from '../../../minarets-api/auth';
import type { User } from '../../../minarets-api/minarets/types';

const providers: ProvidersType = [
  Providers.Email({
    server: {
      host: process.env.EMAIL_SERVER_HOST || '',
      port: 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER || '',
        pass: process.env.EMAIL_SERVER_PASSWORD || '',
      },
    },
    from: process.env.EMAIL_FROM,
  }),
];

if (process.env.NEXTAUTH_GOOGLE_ID && process.env.NEXTAUTH_GOOGLE_SECRET) {
  providers.push(
    Providers.Google({
      clientId: process.env.NEXTAUTH_GOOGLE_ID,
      clientSecret: process.env.NEXTAUTH_GOOGLE_SECRET,
    }),
  );
}

const options: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: MinaretsAdapter(),
  providers,
  callbacks: {
    session(session: Session, user: NextAuthUser | User): Promise<WithAdditionalParams<Session>> {
      const sessionWithUserToken = { ...session };
      if (user) {
        sessionWithUserToken.user.token = (user as User).token;
      }

      return Promise.resolve(sessionWithUserToken);
    },
  },
};

export default (req: NextApiRequest, res: NextApiResponse): ReturnType<NextApiHandler> => NextAuth(req, res, options);
