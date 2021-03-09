import Debug from 'debug';
import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import ArtistRandomConcertLink from '../../../components/ArtistRandomConcertLink';
import ConcertLinkRow from '../../../components/ConcertLinkRow';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Minarets } from '../../../minarets-api';
import { getArtistUrl } from '../../../minarets-api/artistService';
import type { Artist, ArtistSummary } from '../../../minarets-api/minarets/types';
import { pick } from '../../../minarets-api/objectService';
import type { LimitedConcert, LimitedTour, LimitedTourWithLimitedConcerts } from '../../../minarets-api/types';

const debug = Debug('artists:id:slug');

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const artists = await api.artists.listAllArtists();
  const paths = artists.items.map((artist: ArtistSummary) => getArtistUrl(artist));

  return {
    paths,
    // Means other routes should 404
    fallback: false,
  };
}

interface IParams {
  params: {
    id: number;
    slug: string;
  };
}

interface IProps {
  artist: Artist;
  latestConcertsByTour: LimitedTourWithLimitedConcerts[];
  popularConcerts: LimitedConcert[];
  newConcerts: LimitedConcert[];
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  debug(`/artists/${params.id}/${params.slug}`);
  const api = new Minarets();

  const [
    artist, //
    popularConcertResults,
    newConcertResults,
    latestConcertResults,
    tourResults,
  ] = await Promise.all([
    api.artists.getArtist(params.id),
    api.concerts.listConcertsByArtist({
      artistId: params.id,
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    api.concerts.listConcertsByArtist({
      artistId: params.id,
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    api.concerts.listConcertsByArtist({
      artistId: params.id,
      sortDesc: 'ConcertDate',
      itemsPerPage: 20,
    }),
    api.tours.listTours(),
  ]);

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
      artist,
      latestConcertsByTour,
      popularConcerts: popularConcertResults.items.map((concert) => pick(concert, 'id', 'date', 'name')),
      newConcerts: newConcertResults.items.map((concert) => pick(concert, 'id', 'date', 'name')),
      toursById,
    },
    // Re-generate the data at most every 24 hours
    revalidate: 86400,
  };
}

export default function Page({ artist, latestConcertsByTour, popularConcerts, newConcerts, toursById }: IProps): ReactElement {
  const title = artist.name;
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <nav className="d-none d-lg-block" aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/artists">
              <a>Artists</a>
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {artist.name}
          </li>
        </ol>
      </nav>

      <header>
        <h1>{artist.name}</h1>
      </header>

      <section className="card mb-3">
        <h4 className="card-header">Artist Information</h4>
        <div className="card-body">
          <strong>Concerts: </strong>
          {` ${artist.concertCount} `}
          <ArtistRandomConcertLink artist={artist} />
        </div>
      </section>

      <div className="row">
        <div className="col-lg">
          <section className="card mb-3">
            <h4 className="card-header">Most Popular Concerts</h4>
            <div className="card-body">
              {popularConcerts.map((concert) => (
                <ConcertLinkRow concert={concert} key={concert.id} />
              ))}
            </div>
          </section>
          <section className="card mb-3 mb-lg-0">
            <h4 className="card-header">Recently Added Concerts</h4>
            <div className="card-body">
              {newConcerts.map((concert) => (
                <ConcertLinkRow concert={concert} key={concert.id} />
              ))}
            </div>
          </section>
        </div>
        <div className="col-lg">
          <section className="card">
            <h4 className="card-header">Latest Concerts</h4>
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
          </section>
        </div>
      </div>
    </>
  );
}
