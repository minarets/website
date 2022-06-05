import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import '../styles/globals.scss';
import Layout from '../components/Layout';
import { ChatProvider } from '../contexts/ChatContext';
import { PlayerProvider } from '../contexts/PlayerContext';
import { init } from '../minarets-api/sentryService';

interface IPageProps {
  session: Session;
}

interface IProps extends AppProps<IPageProps> {
  err?:
    | (Error & {
        statusCode?: number;
      })
    | null;
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  init();
}

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/naming-convention
function App({ Component, pageProps, err }: IProps): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const session: Session = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...pageProps.session,
  };

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <PlayerProvider>
          <ChatProvider>
            <Layout>
              {/* eslint-disable-next-line react/jsx-props-no-spreading */}
              <Component {...pageProps} err={err} />
            </Layout>
          </ChatProvider>
        </PlayerProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

App.defaultProps = {
  err: undefined,
};

export default App;
