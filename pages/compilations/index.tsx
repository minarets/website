import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import CompilationLinkRow from '../../components/CompilationLinkRow';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Minarets } from '../../minarets-api';
import type { BasicCompilation } from '../../minarets-api/minarets/types';

interface IProps {
  allCompilations: BasicCompilation[];
  popularCompilations: BasicCompilation[];
  recentCompilations: BasicCompilation[];
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  const [
    allCompilationResults, //
    popularCompilationResults,
    recentCompilationResults,
  ] = await Promise.all([
    api.compilations.listCompilations({
      sortAsc: 'Name',
      itemsPerPage: 30,
    }),
    api.compilations.listCompilations({
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    api.compilations.listCompilations({
      sortDesc: 'ModifiedOn',
      itemsPerPage: 15,
    }),
  ]);

  return {
    props: {
      allCompilations: allCompilationResults.items,
      popularCompilations: popularCompilationResults.items,
      recentCompilations: recentCompilationResults.items,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ allCompilations, popularCompilations, recentCompilations }: IProps): ReactElement {
  const title = 'Compilations';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <div className="row">
        <div className="col-lg">
          <section className="card mb-3 mb-lg-0">
            <h4 className="card-header">All Compilations</h4>
            <div className="card-body">
              {allCompilations.map((compilation) => (
                <CompilationLinkRow compilation={compilation} key={compilation.id} />
              ))}
            </div>
          </section>
        </div>
        <div className="col-lg">
          <section className="card mb-3">
            <h4 className="card-header">Popular Compilations</h4>
            <div className="card-body">
              {popularCompilations.map((compilation) => (
                <CompilationLinkRow compilation={compilation} key={compilation.id} />
              ))}
            </div>
          </section>

          <section className="card">
            <h4 className="card-header">Recently Added/Updated Compilations</h4>
            <div className="card-body">
              {recentCompilations.map((compilation) => (
                <CompilationLinkRow compilation={compilation} key={compilation.id} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
