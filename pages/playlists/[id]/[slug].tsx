import moment from 'moment';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import type { ReactElement } from 'react';

import { Minarets } from '../../../api';
import { extractTokenDetailsFromConcertNote, getConcertName, getConcertUrl } from '../../../api/concertService';
import type { BasicArtist, ErrorWithResponse, Playlist } from '../../../api/minarets/types';
import { pick } from '../../../api/objectService';
import { slugify } from '../../../api/stringService';
import type { LimitedArtist, LimitedConcert, LimitedConcertWithTokenDetails, LimitedTour, LimitedTourWithLimitedConcerts } from '../../../api/types';
import ConcertLinkRow from '../../../components/ConcertLinkRow';
import Layout from '../../../components/Layout';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import TrackLinkRow from '../../../components/TrackLinkRow';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  // NOTE: Only pre-rendering the top 20 most popular playlists. Others will be lazy loaded
  const api = new Minarets();
  const playlists = await api.playlists.listPlaylists({
    itemsPerPage: 20,
    page: 1,
    sortDesc: 'Popular',
  });
  const paths = playlists.items.map((playlist: Playlist) => `/playlists/${playlist.id}/${slugify(playlist.name)}`);

  return {
    paths,
    fallback: true,
  };
}

interface IParams {
  params: {
    id: number;
  };
}

type LimitedConcertWithTokenDetailsAndArtistId = LimitedConcertWithTokenDetails & {
  artistId: BasicArtist['id'];
};

interface IProps {
  playlist: Playlist;
  relatedConcertsByTour: LimitedTourWithLimitedConcerts[];
  toursById: Record<string, LimitedTour>;
  concertsById: Record<string, LimitedConcertWithTokenDetailsAndArtistId>;
  artistsById: Record<number, LimitedArtist>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Minarets();
  let playlist: Playlist;
  try {
    playlist = await api.playlists.getPlaylist(params.id);
    if (!playlist) {
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
    api.concerts.listConcertsByPlaylist({
      playlistId: params.id,
      sortAsc: 'ConcertDate',
      itemsPerPage: 100000,
    }),
    api.tours.listTours(),
  ]);

  const toursById = tourResults.items.reduce((acc: Record<string, LimitedTour>, tour) => {
    acc[tour.id] = pick(tour, 'id', 'name', 'parentId', 'slug');

    return acc;
  }, {});

  concertsResults.items.sort((item1, item2) => {
    return new Date(item1.date).getTime() - new Date(item2.date).getTime();
  });

  const artistsById: Record<number, LimitedArtist> = {};
  const concertsById: Record<string, LimitedConcertWithTokenDetailsAndArtistId> = {};
  const concertsByTourId: Record<string, LimitedConcert[]> = {};
  for (const concert of concertsResults.items) {
    const { detailsByToken: tokenDetails } = extractTokenDetailsFromConcertNote(concert);
    const concertSummary = pick(concert, 'id', 'date', 'name');
    concertsById[concert.id] = {
      ...concertSummary,
      tokenDetails,
      artistId: concert.artist.id,
    };

    if (!artistsById[concert.artist.id]) {
      artistsById[concert.artist.id] = pick(concert.artist, 'id', 'name', 'abbr');
    }

    concertsByTourId[concert.tour.id] = concertsByTourId[concert.tour.id] || [];
    concertsByTourId[concert.tour.id].push(concertSummary);
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
      playlist,
      concertsById,
      relatedConcertsByTour,
      toursById,
      artistsById,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ playlist, concertsById, relatedConcertsByTour, toursById, artistsById }: IProps): ReactElement {
  const router = useRouter();
  if (router.isFallback) {
    return (
      <Layout title="Loading playlist...">
        <div className="content">Loading...</div>
      </Layout>
    );
  }

  const createdOn = moment.utc(playlist.createdOn);

  return (
    <Layout title={playlist.name}>
      <div className="content">
        <nav className="d-none d-lg-block" aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link href="/playlists">
                <a>Playlists</a>
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {playlist.name}
            </li>
          </ol>
        </nav>

        <header>
          <h1>{playlist.name}</h1>
        </header>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Playlist Information</h2>
          </div>
          <div className="card-body">
            <table className="table">
              <tbody>
                <tr>
                  <th>Name:</th>
                  <td>{playlist.name}</td>
                </tr>
                <tr>
                  <th>Description:</th>
                  <td>{playlist.description}</td>
                </tr>
                <tr>
                  <th>Created:</th>
                  <td>
                    {createdOn.format('MMM d, yyyy')} by {playlist.createdBy.name}
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
            {playlist.tracks.map((track, index) => {
              const concert = concertsById[track.concertId];
              const concertUrl = getConcertUrl(concert);
              const artist = artistsById[concert.artistId];
              const artistUrl = `/artists/${artist.id}/${slugify(artist.name)}`;
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

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Related Concerts</h2>
            </div>
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
