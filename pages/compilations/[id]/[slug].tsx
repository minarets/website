import moment from 'moment';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import type { ReactElement } from 'react';
import ContentLoader from 'react-content-loader';

import ConcertLinkRow from '../../../components/ConcertLinkRow';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import TrackLinkRow from '../../../components/TrackLinkRow';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Minarets } from '../../../minarets-api';
import { getArtistUrl } from '../../../minarets-api/artistService';
import { getCompilationUrl } from '../../../minarets-api/compilationService';
import { extractTokenDetailsFromConcertNote, getConcertName, getConcertUrl } from '../../../minarets-api/concertService';
import type { BasicArtist, Compilation, CompilationSummary, ErrorWithResponse } from '../../../minarets-api/minarets/types';
import { pick } from '../../../minarets-api/objectService';
import type { LimitedArtist, LimitedConcert, LimitedConcertWithTokenDetails, LimitedTour, LimitedTourWithLimitedConcerts } from '../../../minarets-api/types';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const compilations = await api.compilations.listAllCompilations();
  const paths = compilations.items.map((compilation: CompilationSummary) => getCompilationUrl(compilation));

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
  const router = useRouter();
  const title = router.isFallback ? 'Loading compilation...' : compilation.name;
  useDocumentTitle(title);

  if (router.isFallback) {
    return (
      <>
        <Head>
          <title>{title} · Minarets</title>
        </Head>

        <ContentLoader speed={2} width={700} height={350} viewBox="0 0 700 350" backgroundColor="#e9ecef" foregroundColor="#ced4da">
          {/* Page title */}
          <rect className="rounded" x="0" y="0" rx="4" ry="4" width="480" height="24" />

          {/* Card border */}
          <rect x="0" y="40" rx="3" ry="3" width="8" height="260" />
          <rect x="0" y="294" rx="3" ry="3" width="670" height="8" />
          <rect x="664" y="40" rx="3" ry="3" width="8" height="260" />
          <rect x="0" y="40" rx="3" ry="3" width="668" height="8" />

          {/* Card title */}
          <rect x="16" y="64" rx="4" ry="4" width="140" height="11" />
          <rect x="186" y="64" rx="4" ry="4" width="210" height="11" />
          <rect x="0" y="88" rx="3" ry="3" width="670" height="4" />

          {/* Card labels and values */}
          <rect x="16" y="116" rx="4" ry="4" width="60" height="11" />
          <rect x="130" y="116" rx="4" ry="4" width="265" height="11" />

          <rect x="16" y="156" rx="4" ry="4" width="80" height="11" />
          <rect x="130" y="156" rx="4" ry="4" width="50" height="11" />
          <rect x="16" y="196" rx="4" ry="4" width="70" height="11" />
          <rect x="130" y="196" rx="4" ry="4" width="180" height="11" />
          <rect x="16" y="236" rx="4" ry="4" width="90" height="11" />
          <rect x="130" y="236" rx="4" ry="4" width="520" height="11" />
          <rect x="130" y="256" rx="4" ry="4" width="520" height="11" />
          <rect x="130" y="276" rx="4" ry="4" width="520" height="11" />
        </ContentLoader>
      </>
    );
  }

  const createdOn = moment.utc(compilation.createdOn);

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
