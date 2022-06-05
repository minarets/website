import moment from 'moment';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import * as React from 'react';

import ConcertAndArtistLinkRow from '../components/ConcertAndArtistLinkRow';
import TourBreadcrumbRow from '../components/TourBreadcrumbRow';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Minarets } from '../minarets-api';
import { pick } from '../minarets-api/objectService';
import type { LimitedArtist, LimitedConcertWithArtistId, LimitedTour, LimitedTourWithLimitedConcertsWithArtistId } from '../minarets-api/types';

interface IProps {
  popularConcerts: LimitedConcertWithArtistId[];
  newConcerts: LimitedConcertWithArtistId[];
  latestConcertsByTour: LimitedTourWithLimitedConcertsWithArtistId[];
  artistsById: Record<number, LimitedArtist>;
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps(): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();
  const [
    popularConcertsResults, //
    newConcertsResults,
    latestConcertsResults,
    tourResults,
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
    api.tours.listTours(),
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

  const toursById: Record<string, Pick<LimitedTour, 'id' | 'name' | 'parentId' | 'slug'>> = {};
  for (const tour of tourResults.items) {
    toursById[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');
  }

  const latestConcertsByTour: LimitedTourWithLimitedConcertsWithArtistId[] = [];
  for (const concert of latestConcertsResults.items) {
    if (!latestConcertsByTour.length || latestConcertsByTour[latestConcertsByTour.length - 1].tour.id !== concert.tour.id) {
      latestConcertsByTour.push({
        tour: toursById[concert.tour.id],
        concerts: [],
      });
    }

    latestConcertsByTour[latestConcertsByTour.length - 1].concerts.push({
      ...pick(concert, 'id', 'date', 'name'),
      artistId: concert.artist.id,
    });
  }

  return {
    props: {
      popularConcerts,
      newConcerts,
      latestConcertsByTour,
      artistsById,
      toursById,
    },
    // Re-generate the data at most every 5 minutes
    revalidate: 300,
  };
}

export default function Page({ popularConcerts, newConcerts, latestConcertsByTour, artistsById, toursById }: IProps): JSX.Element {
  const title = 'A community for Dave Matthews Band fans';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <div className="row">
        <div className="col-xl">
          <div className="card mb-3">
            <h4 className="card-header">Most Popular Concerts</h4>
            <div className="card-body">
              {popularConcerts.map((concert) => (
                <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
              ))}
            </div>
          </div>
          <div className="card mb-3 mb-lg-0">
            <h4 className="card-header">Recently Added Concerts</h4>
            <div className="card-body">
              {newConcerts.map((concert) => (
                <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
              ))}
            </div>
          </div>
        </div>
        <div className="col-xl">
          <div className="card">
            <h4 className="card-header">Latest Concerts</h4>
            <div className="card-body">
              {latestConcertsByTour.map((latestConcerts: LimitedTourWithLimitedConcertsWithArtistId) => (
                <div className="pb-4" key={`${latestConcerts.tour.id}_${latestConcerts.concerts[0].id}`}>
                  <TourBreadcrumbRow tour={latestConcerts.tour} toursById={toursById} key={latestConcerts.tour.id} />

                  {latestConcerts.concerts.map((concert) => (
                    <ConcertAndArtistLinkRow artist={artistsById[concert.artistId]} concert={concert} key={concert.id} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
