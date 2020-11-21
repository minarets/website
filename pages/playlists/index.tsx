import type { GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Playlists } from '../../api/minarets';
import type { Playlist } from '../../api/minarets/types/Playlist';
import Layout from '../../components/Layout';
import PlaylistLinkRow from '../../components/PlaylistLinkRow';

interface IProps {
  allPlaylists: Playlist[];
  popularPlaylists: Playlist[];
  recentPlaylists: Playlist[];
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const playlistsApi = new Playlists();

  const [
    allPlaylistResults, //
    popularPlaylistResults,
    recentPlaylistResults,
  ] = await Promise.all([
    playlistsApi.listPlaylists({
      sortAsc: 'Name',
      itemsPerPage: 30,
    }),
    playlistsApi.listPlaylists({
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    playlistsApi.listPlaylists({
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
  return (
    <Layout title="Playlists">
      <section>
        <div className="row">
          <div className="col-md">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">All Playlists</h2>
              </div>
              <div className="card-body">
                {allPlaylists.map((playlist) => (
                  <PlaylistLinkRow playlist={playlist} key={playlist.id} />
                ))}
              </div>
            </div>
          </div>
          <div className="col-md">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Popular Playlists</h2>
              </div>
              <div className="card-body">
                {popularPlaylists.map((playlist) => (
                  <PlaylistLinkRow playlist={playlist} key={playlist.id} />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recently Added/Updated Playlists</h2>
              </div>
              <div className="card-body">
                {recentPlaylists.map((playlist) => (
                  <PlaylistLinkRow playlist={playlist} key={playlist.id} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
