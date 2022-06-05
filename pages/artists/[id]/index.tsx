import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';

import { Minarets } from '../../../minarets-api';
import { getArtistUrl } from '../../../minarets-api/artistService';
import type { ArtistSummary } from '../../../minarets-api/minarets/types';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const artists = await api.artists.listAllArtists();
  const paths = artists.items.map((artist: ArtistSummary) => `/artists/${artist.id}`);

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

  const artist = await api.artists.getArtist(params.id);
  if (!artist) {
    return {
      notFound: true,
    };
  }

  const url = getArtistUrl(artist);

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
