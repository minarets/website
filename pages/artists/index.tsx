import type { GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../api/minarets';
import type { Artist } from '../../api/minarets/types';
import ArtistWithConcertCountLinkRow from '../../components/ArtistWithConcertCountLinkRow';
import Layout from '../../components/Layout';

interface IProps {
  allArtists: Artist[];
  popularArtists: Artist[];
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();
  const [
    allArtistResults, //
    popularArtistResults,
  ] = await Promise.all([
    api.artists.listArtists({
      sortAsc: 'Name',
      itemsPerPage: 10,
    }),
    api.artists.listArtists({
      sortDesc: 'ConcertCount',
      itemsPerPage: 10,
    }),
  ]);

  return {
    props: {
      allArtists: allArtistResults.items,
      popularArtists: popularArtistResults.items,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ allArtists, popularArtists }: IProps): ReactElement {
  return (
    <Layout title="Artists">
      <section>
        <div className="row">
          <div className="col-md">
            <div className="card">
              <h4 className="card-header">All Artists</h4>
              <div className="card-body">
                {allArtists.map((artist) => (
                  <ArtistWithConcertCountLinkRow artist={artist} key={artist.id} />
                ))}
              </div>
            </div>
          </div>
          <div className="col-md">
            <div className="card">
              <h4 className="card-header">Popular Artists</h4>
              <div className="card-body">
                {popularArtists.map((artist) => (
                  <ArtistWithConcertCountLinkRow artist={artist} key={artist.id} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
