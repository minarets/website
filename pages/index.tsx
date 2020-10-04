import * as React from 'react';
import { ReactElement } from 'react';
import Layout from '../components/Layout';

export default function Home(): ReactElement {
  return (
    <Layout title="A community for Dave Matthews Band fans">
      <section>Hey, we made it!</section>
    </Layout>
  );
}
