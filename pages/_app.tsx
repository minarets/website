import type { Session } from 'next-auth';
import { Provider } from 'next-auth/client';
import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';
import * as React from 'react';

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

// eslint-disable-next-line @typescript-eslint/naming-convention
function App({ Component, pageProps, err }: IProps): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const session: Session = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...pageProps.session,
  };

  return (
    <Provider session={session}>
      <PlayerProvider>
        <ChatProvider>
          <Layout>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Component {...pageProps} err={err} />
          </Layout>
        </ChatProvider>
      </PlayerProvider>
    </Provider>
  );
}

App.defaultProps = {
  err: undefined,
};

export default App;
