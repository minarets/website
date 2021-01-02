import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../api/minarets';
import type { Venue, VenueSummary } from '../../../api/minarets/types';
import { pick } from '../../../api/objectService';
import { slugify } from '../../../api/stringService';
import type { LimitedConcert, LimitedTour, LimitedTourWithLimitedConcerts } from '../../../api/types';
import ConcertLinkRow from '../../../components/ConcertLinkRow';
import Layout from '../../../components/Layout';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import VenueAddress from '../../../components/VenueAddress';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const venues = await api.venues.listAllVenues();
  const paths = venues.items.map((venue: VenueSummary) => `/venues/${venue.id}/${slugify(venue.name)}`);

  return {
    paths,
    // Means other routes should 404
    fallback: false,
  };
}

interface IParams {
  params: {
    id: number;
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

  if (!venue.formattedAddress) {
    venue.formattedAddress = await api.venues.setVenueFormattedAddress(venue);
  }

  const toursById = tourResults.items.reduce((acc: Record<string, LimitedTour>, tour) => {
    acc[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');

    return acc;
  }, {});

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
  return (
    <Layout title={venue.name}>
      <div className="content">
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

        <div className="card mb-3">
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
        </div>

        <div className="row">
          <div className="col-md">
            <div className="card mb-3 mb-md-0">
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
            </div>
          </div>
          <div className="col-md">
            <div className="card mb-3">
              <h4 className="card-header">Most Popular Concerts</h4>
              <div className="card-body">
                {popularConcerts.map((concert) => (
                  <ConcertLinkRow concert={concert} key={concert.id} />
                ))}
              </div>
            </div>

            <div className="card">
              <h4 className="card-header">Recently Added Concerts</h4>
              <div className="card-body">
                {newConcerts.map((concert) => (
                  <ConcertLinkRow concert={concert} key={concert.id} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
