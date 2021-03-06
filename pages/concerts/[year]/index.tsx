import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../minarets-api';
import { getTourUrl } from '../../../minarets-api/tourService';

export function getStaticPaths(): GetStaticPathsResult {
  const currentYear = new Date().getFullYear();
  const paths: string[] = [];
  for (let year = 1991; year <= currentYear; year += 1) {
    paths.push(`/concerts/${year}`);
  }

  return {
    paths,
    fallback: true,
  };
}

interface IParams {
  params: {
    year: string;
  };
}

interface IProps {
  url: string;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  const tour = await api.tours.getTour(params.year);
  if (!tour) {
    return {
      notFound: true,
    };
  }
  const url = getTourUrl(tour);

  return {
    props: {
      url,
    },
    redirect: {
      destination: url,
      permanent: false,
    },
  };
}

export default function Page({ url }: IProps): ReactElement {
  return (
    <Head>
      <meta httpEquiv="refresh" content={`0;url=${url}`} />
    </Head>
  );
}
