import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Tours, Concerts } from '../../api/minarets';
import type { Tour } from '../../api/minarets/types/Tour';
import type { TourSummary } from '../../api/minarets/types/TourSummary';
import type { TourWithConcerts } from '../../api/types/TourWithConcerts';
import ConcertLinkRow from '../../components/ConcertLinkRow';
import Layout from '../../components/Layout';
import TourBreadcrumbRow from '../../components/TourBreadcrumbRow';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const toursApi = new Tours();
  const tours = await toursApi.listAllTours();
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
  concertsByTour: TourWithConcerts[];
  toursById: Record<number, Tour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const toursApi = new Tours();
  const concertsApi = new Concerts();

  const [
    tour, //
    concertResults,
  ] = await Promise.all([
    toursApi.getTour(params.slug),
    concertsApi.listConcertsByTour({
      tourSlug: params.slug,
      sortAsc: 'ConcertDate',
      itemsPerPage: 10000,
    }),
  ]);

  const toursById = tour.children.reduce((acc: Record<string, Tour>, childTour) => {
    acc[childTour.id] = childTour;

    return acc;
  }, {});
  toursById[tour.id] = tour;

  const concertsByTour: TourWithConcerts[] = [];
  for (const concert of concertResults.items) {
    if (!concertsByTour.length || concertsByTour[concertsByTour.length - 1].tour.id !== concert.tour.id) {
      concertsByTour.push({
        tour: toursById[concert.tour.id],
        concerts: [],
      });
    }

    concertsByTour[concertsByTour.length - 1].concerts.push(concert);
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
  let parentTour: Tour | undefined;
  if (tour.parentId) {
    parentTour = toursById[tour.parentId];
  }

  return (
    <Layout title={tour.name}>
      <div className="content">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrum-item">
              <a href="/tours">Tours</a>
            </li>
            {parentTour && (
              <li className="breadcrumb-item">
                <a href={`/tours/${parentTour.slug}`}>{parentTour.name}</a>
              </li>
            )}
            <li className="breadcrum-item active" aria-current="page">
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
            {concertsByTour.map((latestConcerts: TourWithConcerts) => (
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
