import type { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import ArtistRandomConcertLink from '../../../components/ArtistRandomConcertLink';
import ConcertLinkRow from '../../../components/ConcertLinkRow';
import Layout from '../../../components/Layout';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import { Minarets } from '../../../minarets-api';
import type { Artist, ArtistSummary } from '../../../minarets-api/minarets/types';
import { pick } from '../../../minarets-api/objectService';
import { slugify } from '../../../minarets-api/stringService';
import type { LimitedConcert, LimitedTour, LimitedTourWithLimitedConcerts } from '../../../minarets-api/types';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Minarets();
  const artists = await api.artists.listAllArtists();
  const paths = artists.items.map((artist: ArtistSummary) => `/artists/${artist.id}/${slugify(artist.name)}`);

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
  artist: Artist;
  latestConcertsByTour: LimitedTourWithLimitedConcerts[];
  popularConcerts: LimitedConcert[];
  newConcerts: LimitedConcert[];
  toursById: Record<number, LimitedTour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
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
  return (
    <Layout title={artist.name}>
      <div className="content">
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

        <div className="card mb-3">
          <h4 className="card-header">Artist Information</h4>
          <div className="card-body">
            <strong>Concerts: </strong>
            {` ${artist.concertCount} `}
            <ArtistRandomConcertLink artist={artist} />
          </div>
        </div>

        <div className="row">
          <div className="col-md">
            <div className="card mb-3">
              <h4 className="card-header">Most Popular Concerts</h4>
              <div className="card-body">
                {popularConcerts.map((concert) => (
                  <ConcertLinkRow concert={concert} key={concert.id} />
                ))}
              </div>
            </div>
            <div className="card mb-3 mb-md-0">
              <h4 className="card-header">Recently Added Concerts</h4>
              <div className="card-body">
                {newConcerts.map((concert) => (
                  <ConcertLinkRow concert={concert} key={concert.id} />
                ))}
              </div>
            </div>
          </div>
          <div className="col-md">
            <div className="card">
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
