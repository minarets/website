import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../api/minarets';
import type { Tour, TourSummary } from '../../api/minarets/types';
import { pick } from '../../api/objectService';
import type { LimitedTour, LimitedTourWithLimitedConcerts } from '../../api/types';
import ConcertLinkRow from '../../components/ConcertLinkRow';
import Layout from '../../components/Layout';
import TourBreadcrumbRow from '../../components/TourBreadcrumbRow';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const tours = await api.tours.listAllTours();
  const paths = tours.items.map((tour: TourSummary) => `/tours/${tour.slug}`);

  return {
    paths,
    // Means other routes should 404
    fallback: false,
  };
}

interface IParams {
  params: {
    slug: string;
  };
}

interface IProps {
  tour: Tour;
  concertsByTour: LimitedTourWithLimitedConcerts[];
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  const [
    tour, //
    concertResults,
  ] = await Promise.all([
    api.tours.getTour(params.slug),
    api.concerts.listConcertsByTour({
      tourSlug: params.slug,
      sortAsc: 'ConcertDate',
      itemsPerPage: 10000,
    }),
  ]);

  const toursById = tour.children.reduce((acc: Record<string, LimitedTour>, childTour) => {
    acc[childTour.id] = pick(childTour, 'id', 'name', 'parentId', 'slug');

    return acc;
  }, {});
  toursById[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');

  const concertsByTour: LimitedTourWithLimitedConcerts[] = [];
  for (const concert of concertResults.items) {
    if (!concertsByTour.length || concertsByTour[concertsByTour.length - 1].tour.id !== concert.tour.id) {
      concertsByTour.push({
        tour: toursById[concert.tour.id],
        concerts: [],
      });
    }

    concertsByTour[concertsByTour.length - 1].concerts.push(pick(concert, 'id', 'date', 'name'));
  }

  return {
    props: {
      tour,
      concertsByTour,
      toursById,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ tour, concertsByTour, toursById }: IProps): ReactElement {
  let parentTour: LimitedTour | undefined;
  if (tour.parentId) {
    parentTour = toursById[tour.parentId];
  }

  return (
    <Layout title={tour.name}>
      <div className="content">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/tours">
                <a>Tours</a>
              </Link>
            </li>
            {parentTour && (
              <li className="breadcrumb-item">
                <Link href={`/tours/${parentTour.slug}`}>
                  <a>{parentTour.name}</a>
                </Link>
              </li>
            )}
            <li className="breadcrumb-item active" aria-current="page">
              {tour.name}
            </li>
          </ol>
        </nav>

        <header>
          <h1>{tour.name}</h1>
        </header>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tour Information</h2>
          </div>
          <div className="card-body">
            <strong>Concerts: </strong> {tour.concertCount}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Concerts</h2>
          </div>
          <div className="card-body">
            {concertsByTour.map((latestConcerts: LimitedTourWithLimitedConcerts) => (
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
    </Layout>
  );
}
