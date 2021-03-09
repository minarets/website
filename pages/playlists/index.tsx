import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import PlaylistLinkRow from '../../components/PlaylistLinkRow';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Minarets } from '../../minarets-api';
import type { Playlist } from '../../minarets-api/minarets/types';

interface IProps {
  allPlaylists: Playlist[];
  popularPlaylists: Playlist[];
  recentPlaylists: Playlist[];
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  const [
    allPlaylistResults, //
    popularPlaylistResults,
    recentPlaylistResults,
  ] = await Promise.all([
    api.playlists.listPlaylists({
      sortAsc: 'Name',
      itemsPerPage: 30,
    }),
    api.playlists.listPlaylists({
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    api.playlists.listPlaylists({
      sortDesc: 'ModifiedOn',
      itemsPerPage: 15,
    }),
  ]);

  return {
    props: {
      allPlaylists: allPlaylistResults.items,
      popularPlaylists: popularPlaylistResults.items,
      recentPlaylists: recentPlaylistResults.items,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ allPlaylists, popularPlaylists, recentPlaylists }: IProps): ReactElement {
  const title = 'Playlists';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <div className="row">
        <div className="col-lg">
          <section className="card mb-3 mb-lg-0">
            <h4 className="card-header">All Playlists</h4>
            <div className="card-body">
              {allPlaylists.map((playlist) => (
                <PlaylistLinkRow playlist={playlist} key={playlist.id} />
              ))}
            </div>
          </section>
        </div>
        <div className="col-lg">
          <section className="card mb-3">
            <h4 className="card-header">Popular Playlists</h4>
            <div className="card-body">
              {popularPlaylists.map((playlist) => (
                <PlaylistLinkRow playlist={playlist} key={playlist.id} />
              ))}
            </div>
          </section>

          <section className="card">
            <h4 className="card-header">Recently Added/Updated Playlists</h4>
            <div className="card-body">
              {recentPlaylists.map((playlist) => (
                <PlaylistLinkRow playlist={playlist} key={playlist.id} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
