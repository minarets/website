import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../../minarets-api';
import { getTourUrl } from '../../../../minarets-api/tourService';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const tours = await api.tours.listAllTours();
  const tourSlugs = tours.items.map((tour) => tour.slug);

  const currentYear = new Date().getFullYear();
  const paths: string[] = [];
  for (let year = 1991; year <= currentYear; year += 1) {
    if (tourSlugs.includes(`${year}`)) {
      for (let month = 1; month <= 12; month += 1) {
        paths.push(`/concerts/${year}/${month}`);
        if (month < 10) {
          paths.push(`/concerts/${year}/0${month}`);
        }
      }
    }
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
