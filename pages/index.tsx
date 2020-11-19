import moment from 'moment';
import type { GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Concerts } from '../api/minarets';
import { pick } from '../api/objectService';
import type { LimitedArtist } from '../api/types/LimitedArtist';
import type { LimitedConcertWithArtistId } from '../api/types/LimitedConcertWithArtistId';
import ConcertAndArtistLinkRow from '../components/ConcertAndArtistLinkRow';
import Layout from '../components/Layout';

interface IProps {
  popularConcerts: LimitedConcertWithArtistId[];
  newConcerts: LimitedConcertWithArtistId[];
  latestConcerts: LimitedConcertWithArtistId[];
  artistsById: Record<number, LimitedArtist>;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const concertsApi = new Concerts();
  const [
    popularConcertsResults, //
    newConcertsResults,
    latestConcertsResults,
  ] = await Promise.all([
    concertsApi.listConcerts({
      sortDesc: 'Popular',
      itemsPerPage: 10,
      since: moment().subtract(1, 'w').startOf('day').toDate(),
    }),
    concertsApi.listConcerts({
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    concertsApi.listConcerts({
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
    // Re-generate the data at most every 5 minutes
    revalidate: 300,
  };
}

export default function Page({ popularConcerts, newConcerts, latestConcerts, artistsById }: IProps): ReactElement {
  return (
    <Layout title="A community for Dave Matthews Band fans">
      <section>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Most Popular Concerts</h2>
          </div>
          <div className="card-body">
            {popularConcerts.map((concert) => (
              <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recently Added Concerts</h2>
          </div>
          <div className="card-body">
            {newConcerts.map((concert) => (
              <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Latest Concerts</h2>
          </div>
          <div className="card-body">
            {latestConcerts.map((concert) => (
              <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
