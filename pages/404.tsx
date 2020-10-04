import * as React from 'react';
import { ReactElement } from 'react';
import Layout from '../components/Layout';

export default function NotFound(): ReactElement {
  return (
    <Layout title="Page Not Found">
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Page Not Found</h1>

        <p>Tell me what it is you think you&apos;re missing and I will see what I can find</p>
      </div>
    </Layout>
  );
}
