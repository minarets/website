import moment from 'moment';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import ConcertLinkRow from '../../../components/ConcertLinkRow';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import TrackLinkRow from '../../../components/TrackLinkRow';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Minarets } from '../../../minarets-api';
import { getArtistUrl } from '../../../minarets-api/artistService';
import { getCompilationUrl } from '../../../minarets-api/compilationService';
import { extractTokenDetailsFromConcertNote, getConcertName, getConcertUrl } from '../../../minarets-api/concertService';
import type { BasicArtist, Compilation, ErrorWithResponse } from '../../../minarets-api/minarets/types';
import { pick } from '../../../minarets-api/objectService';
import type { LimitedArtist, LimitedConcert, LimitedConcertWithTokenDetails, LimitedTour, LimitedTourWithLimitedConcerts } from '../../../minarets-api/types';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const [
    allCompilationResults, //
    popularCompilationResults,
    recentCompilationResults,
  ] = await Promise.all([
    api.compilations.listCompilations({
      sortAsc: 'Name',
      itemsPerPage: 30,
    }),
    api.compilations.listCompilations({
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    api.compilations.listCompilations({
      sortDesc: 'ModifiedOn',
      itemsPerPage: 15,
    }),
  ]);

  const paths = new Set<string>();
  for (const compilation of allCompilationResults.items) {
    paths.add(getCompilationUrl(compilation));
  }
  for (const compilation of popularCompilationResults.items) {
    paths.add(getCompilationUrl(compilation));
  }
  for (const compilation of recentCompilationResults.items) {
    paths.add(getCompilationUrl(compilation));
  }

  return {
    paths: Array.from(paths),
    fallback: true,
  };
}

interface IParams {
  params: {
    id: number;
    slug: string;
  };
}

type LimitedConcertWithTokenDetailsAndArtistId = LimitedConcertWithTokenDetails & {
  artistId: BasicArtist['id'];
};

interface IProps {
  compilation: Compilation;
  relatedConcertsByTour: LimitedTourWithLimitedConcerts[];
  toursById: Record<string, LimitedTour>;
  concertsById: Record<string, LimitedConcertWithTokenDetailsAndArtistId>;
  artistsById: Record<number, LimitedArtist>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  let compilation: Compilation;
  try {
    compilation = await api.compilations.getCompilation(params.id);
    if (!compilation) {
      return {
        notFound: true,
      };
    }
  } catch (ex) {
    if ((ex as ErrorWithResponse).response?.status === 404) {
      return {
        notFound: true,
      };
    }

    throw ex;
  }

  const [
    concertsResults, //
    tourResults,
  ] = await Promise.all([
    api.concerts.listConcertsByCompilation({
      compilationId: params.id,
      sortAsc: 'ConcertDate',
      itemsPerPage: 100000,
    }),
    api.tours.listTours(),
  ]);

  const toursById: Record<string, Pick<LimitedTour, 'id' | 'name' | 'parentId' | 'slug'>> = {};
  for (const tour of tourResults.items) {
    toursById[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');
  }

  concertsResults.items.sort((item1, item2) => new Date(item1.date).getTime() - new Date(item2.date).getTime());

  const artistsById: Record<number, LimitedArtist> = {};
  const concertsById: Record<string, LimitedConcertWithTokenDetailsAndArtistId> = {};
  const concertsByTourId: Record<string, LimitedConcert[]> = {};
  for (const concert of concertsResults.items) {
    const { detailsByToken: tokenDetails } = extractTokenDetailsFromConcertNote(concert);
    concertsById[concert.id] = {
      ...pick(concert, 'id', 'date', 'name'),
      tokenDetails,
      artistId: concert.artist.id,
    };

    if (!artistsById[concert.artist.id]) {
      artistsById[concert.artist.id] = pick(concert.artist, 'id', 'name', 'abbr');
    }

    concertsByTourId[concert.tour.id] = concertsByTourId[concert.tour.id] || [];
    concertsByTourId[concert.tour.id].push(pick(concert, 'id', 'date', 'name'));
  }

  const relatedConcertsByTour: LimitedTourWithLimitedConcerts[] = [];
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
      concertsById,
      relatedConcertsByTour,
      toursById,
      artistsById,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ compilation, concertsById, relatedConcertsByTour, toursById, artistsById }: IProps): ReactElement {
  const createdOn = moment.utc(compilation.createdOn);
  const title = compilation.name;
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/compilations">
              <a>Compilations</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {compilation.name}
          </li>
        </ol>
      </nav>

      <header>
        <h1>{compilation.name}</h1>
      </header>

      <section className="card mb-3">
        <h4 className="card-header">Compilation Information</h4>
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
      </section>

      <section className="card mb-3">
        <h4 className="card-header">Tracks</h4>
        <div className="card-body">
          {compilation.tracks.map((track, index) => {
            const concert = concertsById[track.concertId];
            const concertUrl = getConcertUrl(concert);
            const artist = artistsById[concert.artistId];
            const artistUrl = getArtistUrl(artist);
            return (
              <TrackLinkRow
                concertAdditionalDetailsByToken={concert.tokenDetails} //
                track={track}
                trackNumber={index + 1}
                concertUrl={concertUrl}
                concertName={getConcertName(concert)}
                artistUrl={artistUrl}
                key={track.uniqueId || track.id}
              />
            );
          })}
        </div>
      </section>

      <section className="card">
        <h4 className="card-header">Related Concerts</h4>
        <div className="card-body">
          {relatedConcertsByTour.map((tourWithConcerts: LimitedTourWithLimitedConcerts) => (
            <div className="pb-4" key={`${tourWithConcerts.tour.id}_${tourWithConcerts.concerts[0].id}`}>
              <TourBreadcrumbRow tour={tourWithConcerts.tour} toursById={toursById} key={tourWithConcerts.tour.id} />

              {tourWithConcerts.concerts.map((concert) => (
                <ConcertLinkRow concert={concert} key={concert.id} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
