import { ReactElement } from 'react';
import * as React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.scss';

function App({ Component, pageProps }: AppProps): ReactElement {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />;
}

export default App;
