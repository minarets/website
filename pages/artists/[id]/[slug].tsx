import * as React from 'react';
import { ReactElement } from 'react';
import { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import { Artists } from '../../../api/minarets';
import { ArtistIdAndName } from '../../../api/minarets/types/ArtistIdAndName';
import { Artist } from '../../../api/minarets/types/Artist';
import { slugify } from '../../../api/stringService';
import Layout from '../../../components/Layout';

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
}

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Artists();
  const artist = await api.getArtist(params.id);

  return {
    props: {
      artist,
    },
  };
}

export default function Page({ artist }: IProps): ReactElement {
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
              <div className="card-body" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
