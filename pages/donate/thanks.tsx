import Head from 'next/head';
import * as React from 'react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Page(): JSX.Element {
  const title = 'Thank You!';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{`${title} · Minarets`}</title>
      </Head>

      <div className="row">
        <div className="col col-lg-6 col-xl-5">
          <section className="card mb-3">
            <h4 className="card-header">Thank you!</h4>
            <div className="card-body">
              <h5 className="card-title">Thank you for your donation!</h5>
            </div>
            <img src="https://media.giphy.com/media/5xtDarEWbFEH1JUC424/giphy.gif" className="card-img-bottom" alt="Thank you!" />
          </section>
        </div>
      </div>
    </>
  );
}
