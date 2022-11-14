import type { AxiosError } from 'axios';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';

import { Minarets } from '../../../minarets-api';
import { getCompilationUrl } from '../../../minarets-api/compilationService';
import type { Compilation } from '../../../minarets-api/minarets/types';

export function getStaticPaths(): GetStaticPathsResult {
  return {
    paths: [],
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

  let compilation: Compilation;
  try {
    compilation = await api.compilations.getCompilation(params.id);
    if (!compilation) {
      return {
        notFound: true,
      };
    }
  } catch (ex) {
    if ((ex as AxiosError).response?.status === 404) {
      return {
        notFound: true,
      };
    }

    throw ex;
  }

  const url = getCompilationUrl(compilation);

  return {
    props: {
      url,
    },
    revalidate: false,
  };
}

export default function Page({ url }: IProps): JSX.Element {
  return (
    <Head>
      <link rel="canonical" href={url} />
      <meta httpEquiv="refresh" content={`0;url=${url}`} />
    </Head>
  );
}
