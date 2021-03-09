import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../minarets-api';
import type { PlaylistSummary } from '../../../minarets-api/minarets/types';
import { getPlaylistUrl } from '../../../minarets-api/playlistService';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const playlists = await api.playlists.listPlaylists({
    itemsPerPage: 20,
    page: 1,
    sortDesc: 'Popular',
  });
  const paths = playlists.items.map((playlist: PlaylistSummary) => `/playlists/${playlist.id}`);

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
  console.log(`/playlists/${params.id}`);
  const api = new Minarets();

  const playlist = await api.playlists.getPlaylist(params.id);
  if (!playlist) {
    return {
      notFound: true,
    };
  }

  const url = getPlaylistUrl(playlist);

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
