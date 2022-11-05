import Head from 'next/head';
import * as React from 'react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Page(): JSX.Element {
  const title = 'Donation Cancelled';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{`${title} · Minarets`}</title>
      </Head>

      <section className="card mb-3">
        <h4 className="card-header">Donation Cancelled</h4>
        <div className="card-body">
          <p className="card-text">It&#39;s the thought that counts! Please reconsider donating in the future!</p>
        </div>
      </section>
    </>
  );
}
