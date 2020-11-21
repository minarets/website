import moment from 'moment';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { extractTokenDetailsFromConcertNote, getConcertDescription, getConcertKeywords, getConcertTitle, getConcertUrl } from '../../../../../api/concertService';
import { Concerts, Tours } from '../../../../../api/minarets';
import type { Concert } from '../../../../../api/minarets/types/Concert';
import type { ConcertSummary } from '../../../../../api/minarets/types/ConcertSummary';
import { pick } from '../../../../../api/objectService';
import { slugify } from '../../../../../api/stringService';
import type { LimitedConcert } from '../../../../../api/types/LimitedConcert';
import type { LimitedTour } from '../../../../../api/types/LimitedTour';
import ConcertLinkRow from '../../../../../components/ConcertLinkRow';
import Layout from '../../../../../components/Layout';
import TourBreadcrumbRow from '../../../../../components/TourBreadcrumbRow';
import TrackLinkRow from '../../../../../components/TrackLinkRow';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const concertsApi = new Concerts();
  const concerts = await concertsApi.listAllConcerts();
  const paths = concerts.items.map((concert: ConcertSummary) => getConcertUrl(concert));

  return {
    paths,
    // Means other routes should 404
    fallback: false,
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
  previousConcert: LimitedConcert | undefined;
  nextConcert: LimitedConcert | undefined;
  detailsByToken: Record<string, string>;
  noteLines: string[];
  relatedConcerts: LimitedConcert[];
  venueConcerts: LimitedConcert[];
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const concertsApi = new Concerts();
  const toursApi = new Tours();

  const concert = await concertsApi.getConcertByUrlParts(params.year, params.month, params.day, params.slug);
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
    concertsApi.listRelatedConcerts(concert.id), //
    concertsApi.listConcertsByVenue({ venueId: concert.venue.id }),
    toursApi.listTours(),
  ]);

  const toursById = tourResults.items.reduce((acc: Record<string, LimitedTour>, tour) => {
    acc[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');

    return acc;
  }, {});

  const { noteLines, detailsByToken } = extractTokenDetailsFromConcertNote(concert);

  let previousConcert: LimitedConcert | undefined;
  let nextConcert: LimitedConcert | undefined;
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
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ concert, noteLines, detailsByToken, previousConcert, nextConcert, relatedConcerts, venueConcerts, toursById }: IProps): ReactElement {
  const title = getConcertTitle(concert);
  const description = getConcertDescription(concert);
  const keywords = getConcertKeywords(concert);
  return (
    <Layout title={title} description={description} keywords={keywords}>
      <div className="content">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/concerts">Concerts</a>
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
                      &#8592; {moment.utc(previousConcert.date).format('yyyy-MM-DD')} &#8212; {previousConcert.name}
                    </a>
                  </Link>
                </small>
              )}
              {nextConcert && (
                <small className="col text-right">
                  <Link href={getConcertUrl(nextConcert)}>
                    <a>
                      {moment.utc(nextConcert.date).format('yyyy-MM-DD')} &#8212; {nextConcert.name} &#8594;
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

        <div>
          <button type="button">Play</button>
          <button type="button">Add to Queue</button>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Concert Information</h2>
          </div>
          <div className="card-body">
            <table className="table">
              <tbody>
                <tr>
                  <th>Artist:</th>
                  <td>
                    <Link href={`/artists/${concert.artist.id}/${slugify(concert.artist.name)}`}>
                      <a title={concert.artist.name}>{concert.artist.name}</a>
                    </Link>
                  </td>
                </tr>
                <tr>
                  <th>Date:</th>
                  <td>{moment.utc(concert.date).format('MMM D, YYYY')}</td>
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
                    <Link href={`/venues/${concert.venue.id}/${slugify(concert.venue.name)}`}>
                      <a title={concert.venue.name}>{concert.venue.name}</a>
                    </Link>
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
            {concert.tracks.map((track, index) => {
              const concertUrl = getConcertUrl(concert);
              const artistUrl = `/artists/${concert.artist.id}/${slugify(concert.artist.name)}`;
              return (
                <TrackLinkRow
                  concertAdditionalDetailsByToken={detailsByToken} //
                  track={track}
                  trackNumber={index + 1}
                  concertUrl={concertUrl}
                  artistUrl={artistUrl}
                  key={track.id}
                />
              );
            })}
          </div>
        </div>

        {!!noteLines.length && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Notes</h2>
            </div>
            <div className="card-body">
              {noteLines.map((noteLine) => (
                <div key={noteLine}>{noteLine}</div>
              ))}
            </div>
          </div>
        )}

        {!!concert.recordingInformation && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recording Information</h2>
            </div>
            <div className="card-body">
              {concert.recordingInformation.split('\n').map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>
        )}

        <div className="row">
          {!!concert.posterUrl && (
            <div className="col-lg-6 order-lg-last">
              <div className="card">
                <img className="card-img-top" src={`https://meetattheshow.com${concert.posterUrl}`} alt="Concert poster" />
              </div>
            </div>
          )}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Related Concerts</h2>
              </div>
              <div className="card-body">
                {relatedConcerts.map((relatedConcert) => (
                  <ConcertLinkRow concert={relatedConcert} key={relatedConcert.id} />
                ))}
              </div>
            </div>

            {!!concert.posterUrl && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Venue Concerts</h2>
                </div>
                <div className="card-body">
                  {venueConcerts.map((venueConcert) => (
                    <ConcertLinkRow concert={venueConcert} key={venueConcert.id} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {!concert.posterUrl && (
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Venue Concerts</h2>
                </div>
                <div className="card-body">
                  {venueConcerts.map((venueConcert) => (
                    <ConcertLinkRow concert={venueConcert} key={venueConcert.id} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
