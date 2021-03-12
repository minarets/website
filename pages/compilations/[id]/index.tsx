import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../minarets-api';
import { getCompilationUrl } from '../../../minarets-api/compilationService';
import type { CompilationSummary } from '../../../minarets-api/minarets/types';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const compilations = await api.compilations.listAllCompilations();
  const paths = compilations.items.map((compilation: CompilationSummary) => `/compilations/${compilation.id}`);

  return {
    paths,
    fallback: true,
  };
}

interface IParams {
  params: {
    id: number;
  };
}

interface IProps {
  url: string;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  const compilation = await api.compilations.getCompilation(params.id);
  if (!compilation) {
    return {
      notFound: true,
    };
  }

  const url = getCompilationUrl(compilation);

  return {
    props: {
      url,
    },
    revalidate: false,
  };
}

export default function Page({ url }: IProps): ReactElement {
  return (
    <Head>
      <link rel="canonical" href={url} />
      <meta httpEquiv="refresh" content={`0;url=${url}`} />
    </Head>
  );
}
