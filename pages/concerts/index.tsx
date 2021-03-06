import moment from 'moment';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';
import type { ReactElement } from 'react';

import ConcertAndArtistLinkRow from '../../components/ConcertAndArtistLinkRow';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Minarets } from '../../minarets-api';
import { pick } from '../../minarets-api/objectService';
import type { LimitedArtist, LimitedConcertWithArtistId } from '../../minarets-api/types';

interface IProps {
  popularConcerts: LimitedConcertWithArtistId[];
  newConcerts: LimitedConcertWithArtistId[];
  latestConcerts: LimitedConcertWithArtistId[];
  artistsById: Record<number, LimitedArtist>;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();
  const [
    popularConcertsResults, //
    newConcertsResults,
    latestConcertsResults,
  ] = await Promise.all([
    api.concerts.listConcerts({
      sortDesc: 'Popular',
      itemsPerPage: 10,
      since: moment().subtract(1, 'w').startOf('day').toDate(),
    }),
    api.concerts.listConcerts({
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    api.concerts.listConcerts({
      sortDesc: 'ConcertDate',
      itemsPerPage: 10,
    }),
  ]);

  const artistsById: Record<number, LimitedArtist> = {};
  const popularConcerts: LimitedConcertWithArtistId[] = [];
  for (const concert of popularConcertsResults.items) {
    if (!artistsById[concert.artist.id]) {
      artistsById[concert.artist.id] = pick(concert.artist, 'id', 'name', 'abbr');
    }

    popularConcerts.push({
      ...pick(concert, 'id', 'date', 'name'),
      artistId: concert.artist.id,
    });
  }

  const newConcerts: LimitedConcertWithArtistId[] = [];
  for (const concert of newConcertsResults.items) {
    if (!artistsById[concert.artist.id]) {
      artistsById[concert.artist.id] = pick(concert.artist, 'id', 'name', 'abbr');
    }

    newConcerts.push({
      ...pick(concert, 'id', 'date', 'name'),
      artistId: concert.artist.id,
    });
  }

  const latestConcerts: LimitedConcertWithArtistId[] = [];
  for (const concert of latestConcertsResults.items) {
    if (!artistsById[concert.artist.id]) {
      artistsById[concert.artist.id] = pick(concert.artist, 'id', 'name', 'abbr');
    }

    latestConcerts.push({
      ...pick(concert, 'id', 'date', 'name'),
      artistId: concert.artist.id,
    });
  }

  return {
    props: {
      popularConcerts,
      newConcerts,
      latestConcerts,
      artistsById,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ popularConcerts, newConcerts, latestConcerts, artistsById }: IProps): ReactElement {
  const title = 'Concerts';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <div className="row">
        <div className="col-lg">
          <section className="card mb-3">
            <h4 className="card-header">Most Popular Concerts</h4>
            <div className="card-body">
              {popularConcerts.map((concert) => (
                <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
              ))}
            </div>
          </section>
          <section className="card mb-3 mb-lg-0">
            <h4 className="card-header">Recently Added Concerts</h4>
            <div className="card-body">
              {newConcerts.map((concert) => (
                <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
              ))}
            </div>
          </section>
        </div>
        <div className="col-lg">
          <section className="card">
            <h4 className="card-header">Latest Concerts</h4>
            <div className="card-body">
              {latestConcerts.map((concert) => (
                <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
