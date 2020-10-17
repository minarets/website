import moment from 'moment';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import * as React from 'react';
import type { ReactElement } from 'react';

import { extractTokenDetailsFromConcertNote } from '../../../api/concertService';
import { Compilations, Concerts, Tours } from '../../../api/minarets';
import type { BasicConcertWithNotes } from '../../../api/minarets/types/BasicConcertWithNotes';
import type { Compilation } from '../../../api/minarets/types/Compilation';
import type { CompilationSummary } from '../../../api/minarets/types/CompilationSummary';
import type { Tour } from '../../../api/minarets/types/Tour';
import { slugify } from '../../../api/stringService';
import type { TourWithConcerts } from '../../../api/types/TourWithConcerts';
import ConcertLinkRow from '../../../components/ConcertLinkRow';
import Layout from '../../../components/Layout';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import TrackLinkRow from '../../../components/TrackLinkRow';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const compilationsApi = new Compilations();
  const compilations = await compilationsApi.listAllCompilations();
  const paths = compilations.items.map((compilation: CompilationSummary) => `/compilations/${compilation.id}/${slugify(compilation.name)}`);

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
  compilation: Compilation;
  relatedConcertsByTour: TourWithConcerts[];
  concertAdditionalDetailsByTokenByConcertId: Record<string, Record<string, string>>;
  toursById: Record<string, Tour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const compilationsApi = new Compilations();
  const concertsApi = new Concerts();
  const toursApi = new Tours();
  const [
    compilation, //
    concertsResults,
    tourResults,
  ] = await Promise.all([
    compilationsApi.getCompilation(params.id),
    concertsApi.listConcertsByCompilation({
      compilationId: params.id,
      sortAsc: 'ConcertDate',
      itemsPerPage: 20,
    }),
    toursApi.listTours(),
  ]);

  const toursById = tourResults.items.reduce((acc: Record<string, Tour>, tour) => {
    acc[tour.id] = tour;

    return acc;
  }, {});

  concertsResults.items.sort((item1, item2) => {
    return new Date(item1.date).getTime() - new Date(item2.date).getTime();
  });

  const concertAdditionalDetailsByTokenByConcertId: Record<string, Record<string, string>> = {};
  const concertsByTourId: Record<string, BasicConcertWithNotes[]> = {};
  for (const concert of concertsResults.items) {
    const { detailsByToken: concertAdditionalDetailsByToken } = extractTokenDetailsFromConcertNote(concert);
    concertAdditionalDetailsByTokenByConcertId[concert.id] = concertAdditionalDetailsByToken;

    concertsByTourId[concert.tour.id] = concertsByTourId[concert.tour.id] || [];
    concertsByTourId[concert.tour.id].push(concert);
  }

  const relatedConcertsByTour: TourWithConcerts[] = [];
  for (const concert of concertsResults.items) {
    if (concertsByTourId[concert.tour.id]) {
      relatedConcertsByTour.push({
        tour: toursById[concert.tour.id],
        concerts: concertsByTourId[concert.tour.id],
      });

      delete concertsByTourId[concert.tour.id];
    }
  }

  return {
    props: {
      compilation,
      relatedConcertsByTour,
      toursById,
      concertAdditionalDetailsByTokenByConcertId,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ compilation, relatedConcertsByTour, concertAdditionalDetailsByTokenByConcertId, toursById }: IProps): ReactElement {
  const createdOn = moment(compilation.createdOn);

  return (
    <Layout title={compilation.name}>
      <div className="content">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrum-item">
              <a href="/compilations">Compilations</a>
            </li>
            <li className="breadcrum-item active" aria-current="page">
              {compilation.name}
            </li>
          </ol>
        </nav>

        <header>
          <h1>{compilation.name}</h1>
        </header>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Compilation Information</h2>
          </div>
          <div className="card-body">
            <table className="table">
              <tbody>
                <tr>
                  <th>Name:</th>
                  <td>{compilation.name}</td>
                </tr>
                <tr>
                  <th>Description:</th>
                  <td>{compilation.description}</td>
                </tr>
                <tr>
                  <th>Created:</th>
                  <td>
                    {createdOn.format('MMM d, yyyy')} by {compilation.createdBy.name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tracks</h2>
          </div>
          <div className="card-body">
            {compilation.tracks.map((track, index) => (
              <TrackLinkRow concertAdditionalDetailsByToken={concertAdditionalDetailsByTokenByConcertId[track.concertId]} track={track} trackNumber={index + 1} />
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Related Concerts</h2>
            </div>
            <div className="card-body">
              {relatedConcertsByTour.map((tourWithConcerts: TourWithConcerts) => (
                <div className="pb-4" key={`${tourWithConcerts.tour.id}_${tourWithConcerts.concerts[0].id}`}>
                  <TourBreadcrumbRow tour={tourWithConcerts.tour} toursById={toursById} key={tourWithConcerts.tour.id} />

                  {tourWithConcerts.concerts.map((concert) => (
                    <ConcertLinkRow concert={concert} key={concert.id} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
