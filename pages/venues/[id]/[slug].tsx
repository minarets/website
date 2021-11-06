import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import ConcertLinkRow from '../../../components/ConcertLinkRow';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import VenueAddress from '../../../components/VenueAddress';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Minarets } from '../../../minarets-api';
import type { Venue, VenueSummary } from '../../../minarets-api/minarets/types';
import { pick } from '../../../minarets-api/objectService';
import type { LimitedConcert, LimitedTour, LimitedTourWithLimitedConcerts } from '../../../minarets-api/types';
import { getVenueUrl } from '../../../minarets-api/venueService';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const venues = await api.venues.listAllVenues();
  const paths = venues.items.map((venue: VenueSummary) => getVenueUrl(venue));

  return {
    paths,
    // Means other routes should 404
    fallback: false,
  };
}

interface IParams {
  params: {
    id: number;
    slug: string;
  };
}

interface IProps {
  venue: Venue;
  latestConcertsByTour: LimitedTourWithLimitedConcerts[];
  popularConcerts: LimitedConcert[];
  newConcerts: LimitedConcert[];
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  const [
    venue, //
    popularConcertResults,
    newConcertResults,
    latestConcertResults,
    tourResults,
  ] = await Promise.all([
    api.venues.getVenue(params.id),
    api.concerts.listConcertsByVenue({
      venueId: params.id,
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    api.concerts.listConcertsByVenue({
      venueId: params.id,
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    api.concerts.listConcertsByVenue({
      venueId: params.id,
      sortDesc: 'ConcertDate',
      itemsPerPage: 20,
    }),
    api.tours.listTours(),
  ]);

  const toursById: Record<string, Pick<LimitedTour, 'id' | 'name' | 'parentId' | 'slug'>> = {};
  for (const tour of tourResults.items) {
    toursById[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');
  }

  const latestConcertsByTour: LimitedTourWithLimitedConcerts[] = [];
  for (const concert of latestConcertResults.items) {
    if (!latestConcertsByTour.length || latestConcertsByTour[latestConcertsByTour.length - 1].tour.id !== concert.tour.id) {
      latestConcertsByTour.push({
        tour: toursById[concert.tour.id],
        concerts: [],
      });
    }

    latestConcertsByTour[latestConcertsByTour.length - 1].concerts.push(pick(concert, 'id', 'date', 'name'));
  }

  return {
    props: {
      venue,
      latestConcertsByTour,
      popularConcerts: popularConcertResults.items.map((concert) => pick(concert, 'id', 'date', 'name')),
      newConcerts: newConcertResults.items.map((concert) => pick(concert, 'id', 'date', 'name')),
      toursById,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ venue, latestConcertsByTour, popularConcerts, newConcerts, toursById }: IProps): ReactElement {
  const title = venue.name;
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <nav className="d-none d-lg-block" aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/venues">
              <a>Venues</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {venue.name}
          </li>
        </ol>
      </nav>

      <header>
        <h1>{venue.name}</h1>
      </header>

      <section className="card mb-3">
        <h4 className="card-header">Venue Information</h4>
        <div className="card-body">
          <table className="table">
            <tbody>
              <tr>
                <th>Concerts:</th>
                <td>{venue.concertCount}</td>
              </tr>
              <tr>
                <th>Address:</th>
                <td>
                  <VenueAddress venue={venue} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="row">
        <div className="col-lg">
          <section className="card mb-3 mb-lg-0">
            <h4 className="card-header">Latest Concerts</h4>
            <div className="card-body">
              {latestConcertsByTour.map((latestConcerts: LimitedTourWithLimitedConcerts) => (
                <div className="pb-4" key={`${latestConcerts.tour.id}_${latestConcerts.concerts[0].id}`}>
                  <TourBreadcrumbRow tour={latestConcerts.tour} toursById={toursById} key={latestConcerts.tour.id} />

                  {latestConcerts.concerts.map((concert) => (
                    <ConcertLinkRow concert={concert} key={concert.id} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="col-lg">
          <section className="card mb-3">
            <h4 className="card-header">Most Popular Concerts</h4>
            <div className="card-body">
              {popularConcerts.map((concert) => (
                <ConcertLinkRow concert={concert} key={concert.id} />
              ))}
            </div>
          </section>

          <section className="card">
            <h4 className="card-header">Recently Added Concerts</h4>
            <div className="card-body">
              {newConcerts.map((concert) => (
                <ConcertLinkRow concert={concert} key={concert.id} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
