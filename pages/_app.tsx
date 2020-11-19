import { Provider } from 'next-auth/client';
import type { AppProps } from 'next/app';
import type { ReactElement } from 'react';
import * as React from 'react';
import '../styles/globals.scss';

function App({ Component, pageProps }: AppProps): ReactElement {
  return (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    <Provider session={pageProps.session}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </Provider>
  );
}

export default App;
