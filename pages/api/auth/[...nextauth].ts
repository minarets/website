import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import type { User as NextAuthUser, InitOptions } from 'next-auth';
import type { SessionBase, GenericObject } from 'next-auth/_utils';
import Providers from 'next-auth/providers';

import MinaretsAdapter from '../../../api/auth';
import type { User } from '../../../api/minarets/types/User';

interface IExtendedNextAuthUser extends NextAuthUser {
  token: string;
}

const providers = [
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

const options: InitOptions = {
  secret: process.env.AUTH_SECRET,
  adapter: MinaretsAdapter(),
  providers,
  callbacks: {
    session(session: SessionBase, user: User): Promise<GenericObject> {
      if (!user) {
        return Promise.resolve(session);
      }

      const sessionWithUserToken = { ...session };
      (sessionWithUserToken.user as IExtendedNextAuthUser).token = user.token;

      return Promise.resolve(sessionWithUserToken);
    },
  },
};

export default (req: NextApiRequest, res: NextApiResponse): Promise<void> => NextAuth(req, res, options);
