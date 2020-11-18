import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Venues, Concerts, Tours } from '../../../api/minarets';
import type { Venue } from '../../../api/minarets/types/Venue';
import type { VenueSummary } from '../../../api/minarets/types/VenueSummary';
import { pick } from '../../../api/objectService';
import { slugify } from '../../../api/stringService';
import type { LimitedConcert } from '../../../api/types/LimitedConcert';
import type { LimitedTour } from '../../../api/types/LimitedTour';
import type { LimitedTourWithLimitedConcerts } from '../../../api/types/LimitedTourWithLimitedConcerts';
import ConcertLinkRow from '../../../components/ConcertLinkRow';
import Layout from '../../../components/Layout';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import VenueAddress from '../../../components/VenueAddress';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const venuesApi = new Venues();
  const venues = await venuesApi.listAllVenues();
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
  const venuesApi = new Venues();
  const concertsApi = new Concerts();
  const toursApi = new Tours();

  const [
    venue, //
    popularConcertResults,
    newConcertResults,
    latestConcertResults,
    tourResults,
  ] = await Promise.all([
    venuesApi.getVenue(params.id),
    concertsApi.listConcertsByVenue({
      venueId: params.id,
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    concertsApi.listConcertsByVenue({
      venueId: params.id,
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    concertsApi.listConcertsByVenue({
      venueId: params.id,
      sortDesc: 'ConcertDate',
      itemsPerPage: 20,
    }),
    toursApi.listTours(),
  ]);

  if (!venue.formattedAddress) {
    venue.formattedAddress = await venuesApi.setVenueFormattedAddress(venue);
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
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/venues">Venues</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {venue.name}
            </li>
          </ol>
        </nav>

        <header>
          <h1>{venue.name}</h1>
        </header>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Venue Information</h2>
          </div>
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
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Latest Concerts</h2>
              </div>
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
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Most Popular Concerts</h2>
              </div>
              <div className="card-body">
                {popularConcerts.map((concert) => (
                  <ConcertLinkRow concert={concert} key={concert.id} />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recently Added Concerts</h2>
              </div>
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