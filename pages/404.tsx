import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFound(): ReactElement {
  const title = 'Page Not Found';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Page Not Found</h1>

        <p>Tell me what it is you think you&apos;re missing and I will see what I can find</p>
      </div>
    </>
  );
}
