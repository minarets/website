import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import type { NextAuthOptions, Session } from 'next-auth';
import type { AppProviders } from 'next-auth/providers';
import Email from 'next-auth/providers/email';
import Google from 'next-auth/providers/google';

import MinaretsAdapter from '../../../minarets-api/auth';
import type { User } from '../../../minarets-api/minarets/types';

const providers: AppProviders = [
  Email({
    server: {
      host: process.env.EMAIL_SERVER_HOST || '',
      port: process.env.EMAIL_SERVER_PORT || 587,
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
    Google({
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
    session({ session, user }): Promise<Session> {
      const sessionWithUserToken = { ...session };
      if (user) {
        sessionWithUserToken.userToken = (user as unknown as User).token;
      }

      return Promise.resolve(sessionWithUserToken);
    },
  },
};

export default (req: NextApiRequest, res: NextApiResponse): ReturnType<NextApiHandler> => NextAuth(req, res, options);
