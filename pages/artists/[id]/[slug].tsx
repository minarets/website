import * as React from 'react';
import { ReactElement } from 'react';
import { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import { Artists, Concerts, Tours } from '../../../api/minarets';
import { ArtistIdAndName } from '../../../api/minarets/types/ArtistIdAndName';
import { Artist } from '../../../api/minarets/types/Artist';
import { slugify } from '../../../api/stringService';
import Layout from '../../../components/Layout';
import TourBreadcrumbRow from '../../../components/TourBreadcrumbRow';
import { Tour } from '../../../api/minarets/types/Tour';
import { TourWithConcerts } from '../../../api/types/TourWithConcerts';
import ConcertLinkRow from '../../../components/ConcertLinkRow';
import { BasicConcert } from '../../../api/minarets/types/BasicConcert';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const api = new Artists();
  const artists = await api.listAllArtists();
  const paths = artists.items.map((artist: ArtistIdAndName) => `/artists/${artist.id}/${slugify(artist.name)}`);

  return {
    paths,
    // Means other routes should 404
    fallback: false,
  };
}

interface IParams {
  params: {
    id: string;
  };
}

interface IProps {
  artist: Artist;
  latestConcertsByTour: TourWithConcerts[];
  popularConcerts: BasicConcert[];
  newConcerts: BasicConcert[];
  toursById: Record<number, Tour>;
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const artistsApi = new Artists();
  const concertsApi = new Concerts();
  const toursApi = new Tours();

  const [
    artist, //
    popularConcertResults,
    newConcertResults,
    latestConcertResults,
    tourResults,
  ] = await Promise.all([
    artistsApi.getArtist(params.id),
    concertsApi.listConcerts({
      sortDesc: 'Popular',
      itemsPerPage: 15,
    }),
    concertsApi.listConcerts({
      sortDesc: 'ApprovedOn',
      itemsPerPage: 10,
    }),
    concertsApi.listConcerts({
      sortDesc: 'ConcertDate',
      itemsPerPage: 20,
    }),
    toursApi.listTours(),
  ]);

  const toursById = tourResults.items.reduce((acc: Record<string, Tour>, tour) => {
    acc[tour.id] = tour;

    return acc;
  }, {});

  const latestConcertsByTour: TourWithConcerts[] = [];
  for (const concert of latestConcertResults.items) {
    if (!latestConcertsByTour.length || latestConcertsByTour[latestConcertsByTour.length - 1].tour.id !== concert.tour.id) {
      latestConcertsByTour.push({
        tour: toursById[concert.tour.id],
        concerts: [],
      });
    }

    latestConcertsByTour[latestConcertsByTour.length - 1].concerts.push(concert);
  }

  return {
    props: {
      artist,
      latestConcertsByTour,
      popularConcerts: popularConcertResults.items,
      newConcerts: newConcertResults.items,
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
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrum-item">
              <a href="/artists">Artists</a>
            </li>
            <li className="breadcrum-item active" aria-current="page">
              {artist.name}
            </li>
          </ol>
        </nav>

        <header>
          <h1>{artist.name}</h1>
        </header>

        <div className="row">
          <div className="col-md">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Artist Information</h2>
              </div>
              <div className="card-body">
                <strong>Concerts: </strong> {artist.concertCount}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Latest Concerts</h2>
              </div>
              <div className="card-body">
                {latestConcertsByTour.map((latestConcerts: TourWithConcerts) => (
                  <div key={`${latestConcerts.tour.id}_${latestConcerts.concerts[0].id}`}>
                    <div className="pb-4">
                      <TourBreadcrumbRow tour={latestConcerts.tour} toursById={toursById} key={latestConcerts.tour.id} />
                    </div>

                    {latestConcerts.concerts.map((concert) => (
                      <ConcertLinkRow concert={concert} key={concert.id} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-md">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Most Popular Concerts</h2>
              </div>
              <div className="card-body">
                {popularConcerts.map((concert) => (
                  <ConcertLinkRow concert={concert} key={concert.id} />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recently Added Concerts</h2>
              </div>
              <div className="card-body">
                {newConcerts.map((concert) => (
                  <ConcertLinkRow concert={concert} key={concert.id} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
