import moment from 'moment';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../../../minarets-api';
import { getConcertUrl } from '../../../../../minarets-api/concertService';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const concerts = await api.concerts.listAllConcerts();
  const paths: Record<string, boolean> = {};
  for (const concert of concerts.items) {
    const concertDate = moment.utc(concert.date);
    paths[`/concerts/${concertDate.format('yyyy')}/${concertDate.format('MM')}/${concertDate.format('DD')}`] = true;
    paths[`/concerts/${concertDate.format('yyyy')}/${concertDate.format('MM')}/${concertDate.format('D')}`] = true;
    paths[`/concerts/${concertDate.format('yyyy')}/${concertDate.format('M')}/${concertDate.format('DD')}`] = true;
    paths[`/concerts/${concertDate.format('yyyy')}/${concertDate.format('M')}/${concertDate.format('D')}`] = true;
  }

  return {
    paths: Object.keys(paths),
    fallback: true,
  };
}

interface IParams {
  params: {
    year: string;
    month: string;
    day: string;
  };
}

interface IProps {
  url: string;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  console.log(`/concerts/${params.year}/${params.month}/${params.day}`);
  const api = new Minarets();

  const concert = await api.concerts.getConcertByUrlParts(params.year, params.month, params.day, 'unknown');
  if (!concert) {
    return {
      notFound: true,
    };
  }
  const url = getConcertUrl(concert);

  return {
    props: {
      url,
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
