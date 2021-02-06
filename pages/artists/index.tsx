import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import ArtistWithConcertCountLinkRow from '../../components/ArtistWithConcertCountLinkRow';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Minarets } from '../../minarets-api';
import type { Artist } from '../../minarets-api/minarets/types';

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
  const title = 'Artists';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <div className="row">
        <div className="col-lg">
          <section className="card">
            <h4 className="card-header">All Artists</h4>
            <div className="card-body">
              {allArtists.map((artist) => (
                <ArtistWithConcertCountLinkRow artist={artist} key={artist.id} />
              ))}
            </div>
          </section>
        </div>
        <div className="col-lg">
          <section className="card">
            <h4 className="card-header">Popular Artists</h4>
            <div className="card-body">
              {popularArtists.map((artist) => (
                <ArtistWithConcertCountLinkRow artist={artist} key={artist.id} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
