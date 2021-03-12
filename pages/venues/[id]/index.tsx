import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../minarets-api';
import type { VenueSummary } from '../../../minarets-api/minarets/types';
import { getVenueUrl } from '../../../minarets-api/venueService';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const venues = await api.venues.listAllVenues();
  const paths = venues.items.map((venue: VenueSummary) => `/venues/${venue.id}`);

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

  const venue = await api.venues.getVenue(params.id);
  if (!venue) {
    return {
      notFound: true,
    };
  }

  const url = getVenueUrl(venue);

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
