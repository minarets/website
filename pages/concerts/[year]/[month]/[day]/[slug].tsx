import * as Sentry from '@sentry/browser';
import moment from 'moment';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import { useSession } from 'next-auth/client';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import type { ReactElement } from 'react';
import ContentLoader from 'react-content-loader';

import ConcertLinkRow from '../../../../../components/ConcertLinkRow';
import TourBreadcrumbRow from '../../../../../components/TourBreadcrumbRow';
import TrackLinkRow from '../../../../../components/TrackLinkRow';
import { usePlayerState } from '../../../../../contexts/PlayerContext';
import { useDocumentTitle } from '../../../../../hooks/useDocumentTitle';
import { Minarets } from '../../../../../minarets-api';
import { getArtistUrl } from '../../../../../minarets-api/artistService';
import { extractTokenDetailsFromConcertNote, getConcertDescription, getConcertKeywords, getConcertTitle, getConcertUrl } from '../../../../../minarets-api/concertService';
import type { Concert } from '../../../../../minarets-api/minarets/types';
import { pick } from '../../../../../minarets-api/objectService';
import { getPlaybackTrack } from '../../../../../minarets-api/trackService';
import type { LimitedConcert, LimitedTour } from '../../../../../minarets-api/types';
import { getVenueUrl } from '../../../../../minarets-api/venueService';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const concerts = await api.concerts.listAllConcerts();
  const paths: string[] = [];
  for (const concert of concerts.items) {
    if (concert && concert.name && concert.date) {
      paths.push(getConcertUrl(concert));
    }
  }

  return {
    paths,
    fallback: true,
  };
}

interface IParams {
  params: {
    year: string;
    month: string;
    day: string;
    slug: string;
  };
}

interface IProps {
  concert: Concert;
  previousConcert: LimitedConcert | null;
  nextConcert: LimitedConcert | null;
  detailsByToken: Record<string, string>;
  noteLines: string[];
  relatedConcerts: LimitedConcert[];
  venueConcerts: LimitedConcert[];
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();

  const concert = await api.concerts.getConcertByUrlParts(params.year, params.month, params.day, params.slug);
  if (!concert) {
    return {
      notFound: true,
    };
  }

  const [
    relatedConcertResults, //
    venueConcertResults,
    tourResults,
  ] = await Promise.all([
    api.concerts.listRelatedConcerts(concert.id), //
    api.concerts.listConcertsByVenue({ venueId: concert.venue.id }),
    api.tours.listTours(),
  ]);

  const toursById: Record<string, Pick<LimitedTour, 'id' | 'name' | 'parentId' | 'slug'>> = {};
  for (const tour of tourResults.items) {
    toursById[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');
  }

  const { noteLines, detailsByToken } = extractTokenDetailsFromConcertNote(concert);

  let previousConcert: LimitedConcert | null = null;
  let nextConcert: LimitedConcert | null = null;
  const relatedConcerts: LimitedConcert[] = [];
  for (const relatedConcert of relatedConcertResults.items) {
    const limitedConcert = pick(relatedConcert, 'id', 'date', 'name');
    relatedConcerts.push(limitedConcert);
    const relatedConcertMoment = moment.utc(relatedConcert.date);

    if (relatedConcertMoment.isBefore(concert.date) && (!previousConcert || relatedConcertMoment.isAfter(previousConcert.date))) {
      previousConcert = limitedConcert;
    }

    if (relatedConcertMoment.isAfter(concert.date) && (!nextConcert || relatedConcertMoment.isBefore(nextConcert.date))) {
      nextConcert = limitedConcert;
    }
  }

  // TODO: Remove notes from concert object
  return {
    props: {
      concert,
      previousConcert,
      nextConcert,
      noteLines,
      detailsByToken,
      relatedConcerts,
      venueConcerts: venueConcertResults.items.map((venueConcert) => pick(venueConcert, 'id', 'date', 'name')),
      toursById,
    },
    // Re-generate the data at most every 15 minutes
    revalidate: 900,
  };
}

export default function Page({ concert, noteLines, detailsByToken, previousConcert, nextConcert, relatedConcerts, venueConcerts, toursById }: IProps): ReactElement {
  const router = useRouter();

  const title = router.isFallback ? 'Loading concert...' : getConcertTitle(concert);
  useDocumentTitle(title);

  const [session] = useSession();
  const playerState = usePlayerState();

  const playCb = React.useCallback(() => {
    playerState.player
      .playTracks(
        concert.tracks.map((track) =>
          getPlaybackTrack(
            {
              ...track,
              concert,
            },
            detailsByToken,
          ),
        ),
      )
      .catch((ex) => Sentry.captureException(ex));
  }, [playerState, concert, detailsByToken]);
  const queueCb = React.useCallback(() => {
    playerState.player.queuePriorityTracks(
      concert.tracks.map((track) =>
        getPlaybackTrack(
          {
            ...track,
            concert,
          },
          detailsByToken,
        ),
      ),
    );
  }, [playerState, concert, detailsByToken]);

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

  const description = getConcertDescription(concert);
  const keywords = getConcertKeywords(concert);
  const concertUrl = getConcertUrl(concert);
  const artistUrl = getArtistUrl(concert.artist);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        {concert.posterUrl && <link rel="preload" href={`https://api.minarets.io${concert.posterUrl}`} as="image" key={`preload-art-${concert.id}`} />}
      </Head>

      <nav className="d-none d-lg-block" aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/concerts">
              <a>Concerts</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      <header>
        {(previousConcert || nextConcert) && (
          <div className="row">
            {previousConcert && (
              <small className="col">
                <Link href={getConcertUrl(previousConcert)}>
                  <a>
                    &#8592; {moment.utc(previousConcert.date).format('yyyy-MM-DD')}
                    <span className="d-none d-lg-inline"> &#8212; {previousConcert.name}</span>
                  </a>
                </Link>
              </small>
            )}
            {nextConcert && (
              <small className="col text-end">
                <Link href={getConcertUrl(nextConcert)}>
                  <a>
                    {moment.utc(nextConcert.date).format('yyyy-MM-DD')}
                    <span className="d-none d-lg-inline"> &#8212; {nextConcert.name}</span> &#8594;
                  </a>
                </Link>
              </small>
            )}
          </div>
        )}
        <h1>
          {moment.utc(concert.date).format('yyyy-MM-DD')} - {concert.name}
        </h1>
      </header>

      {!session && (
        <div className="mb-3">
          <Link href="/api/auth/signin">
            <a className="btn btn-success rounded-pill" rel="nofollow">
              Play
            </a>
          </Link>
        </div>
      )}
      {session && (
        <section className="mb-3">
          <button className="btn btn-success rounded-pill" type="button" onClick={(): void => playCb()}>
            Play
          </button>
          <button className="btn btn-success rounded-pill" type="button" onClick={(): void => queueCb()}>
            Add to Queue
          </button>
        </section>
      )}

      <section className="card mb-3">
        <h4 className="card-header">Concert Information</h4>
        <div className="card-body">
          <table className="table">
            <tbody>
              <tr>
                <th>Artist:</th>
                <td>
                  <Link href={artistUrl}>
                    <a title={concert.artist.name}>{concert.artist.name}</a>
                  </Link>
                </td>
              </tr>
              <tr>
                <th>Date:</th>
                <td>{moment.utc(concert.date).format('MMMM D, YYYY')}</td>
              </tr>
              <tr>
                <th>Tour:</th>
                <td>
                  <TourBreadcrumbRow tour={toursById[concert.tour.id]} toursById={toursById} />
                </td>
              </tr>
              <tr>
                <th>Venue:</th>
                <td>
                  <Link href={getVenueUrl(concert.venue)}>
                    <a title={concert.venue.name}>{concert.venue.name}</a>
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mb-3">
        <h4 className="card-header">Tracks</h4>
        <div className="card-body">
          {concert.tracks.map((track, index) => (
            <TrackLinkRow
              concertAdditionalDetailsByToken={detailsByToken} //
              track={track}
              trackNumber={index + 1}
              concertUrl={concertUrl}
              artistUrl={artistUrl}
              key={track.uniqueId || track.id}
            />
          ))}
        </div>
      </section>

      {!!noteLines.length && (
        <section className="card mb-3">
          <h4 className="card-header">Notes</h4>
          <div className="card-body white-space-pre-line">{noteLines.join('\n')}</div>
        </section>
      )}

      {!!concert.recordingInformation && (
        <section className="card mb-3">
          <h4 className="card-header">Recording Information</h4>
          <div className="card-body white-space-pre-line">{concert.recordingInformation}</div>
        </section>
      )}

      <div className="row">
        {!!concert.posterUrl && (
          <div className="col-lg order-lg-last">
            <section className="card">
              <img className="card-img-top" src={`https://api.minarets.io${concert.posterUrl}`} alt="Concert poster" />
            </section>
          </div>
        )}
        <div className="col-lg">
          <section className="card mb-3">
            <h4 className="card-header">Related Concerts</h4>
            <div className="card-body">
              {relatedConcerts.map((relatedConcert) => (
                <ConcertLinkRow concert={relatedConcert} key={relatedConcert.id} />
              ))}
            </div>
          </section>

          {!!concert.posterUrl && venueConcerts.length > 1 && (
            <section className="card mb-3">
              <h4 className="card-header">Venue Concerts</h4>
              <div className="card-body">
                {venueConcerts.map((venueConcert) => (
                  <ConcertLinkRow concert={venueConcert} key={venueConcert.id} />
                ))}
              </div>
            </section>
          )}
        </div>
        {!concert.posterUrl && venueConcerts.length > 1 && (
          <div className="col-lg">
            <section className="card mb-3">
              <h4 className="card-header">Venue Concerts</h4>
              <div className="card-body">
                {venueConcerts.map((venueConcert) => (
                  <ConcertLinkRow concert={venueConcert} key={venueConcert.id} />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
