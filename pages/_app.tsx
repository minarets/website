import type { Session } from 'next-auth/client';
import { Provider } from 'next-auth/client';
import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';
import * as React from 'react';

import '../styles/globals.scss';
import Layout from '../components/Layout';
import { PlayerProvider } from '../contexts/PlayerContext';
import { init } from '../minarets-api/sentryService';

interface IPageProps {
  session: Session;
}

interface IProps extends AppProps<IPageProps> {
  err?:
    | null
    | (Error & {
        statusCode?: number;
      });
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  init();
}

function App({ Component, pageProps, err }: IProps): ReactElement {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const session: Session = pageProps.session;

  return (
    <Provider session={session}>
      <PlayerProvider>
        <Layout>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <Component {...pageProps} err={err} />
        </Layout>
      </PlayerProvider>
    </Provider>
  );
}

App.defaultProps = {
  err: undefined,
};

export default App;
