import { ReactElement } from 'react';
import * as React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

function MyApp({ Component }: AppProps): ReactElement {
  return <Component />;
}

export default MyApp;
