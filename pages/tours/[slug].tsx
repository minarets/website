import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import ConcertLinkRow from '../../components/ConcertLinkRow';
import TourBreadcrumbRow from '../../components/TourBreadcrumbRow';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Minarets } from '../../minarets-api';
import type { Tour, TourSummary } from '../../minarets-api/minarets/types';
import { pick } from '../../minarets-api/objectService';
import type { LimitedTour, LimitedTourWithLimitedConcerts } from '../../minarets-api/types';

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
  concertCount: number;
  concertsByTour: LimitedTourWithLimitedConcerts[];
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  console.log(`/tours/${params.slug}`);
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

  if (tour.parentId && !toursById[tour.parentId]) {
    const parentTour = await api.tours.getTour(tour.parentId);
    if (parentTour) {
      toursById[parentTour.id] = parentTour;
    }
  }

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
      concertCount: concertResults.items.length,
      concertsByTour,
      toursById,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ tour, concertCount, concertsByTour, toursById }: IProps): ReactElement {
  const title = tour.name;
  useDocumentTitle(title);

  let parentTour: LimitedTour | undefined;
  if (tour.parentId) {
    parentTour = toursById[tour.parentId];
  }

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

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

      <section className="card mb-3">
        <h4 className="card-header">Tour Information</h4>
        <div className="card-body">
          <strong>Concerts: </strong> {concertCount}
        </div>
      </section>

      <section className="card">
        <h4 className="card-header">Concerts</h4>
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
      </section>
    </>
  );
}
