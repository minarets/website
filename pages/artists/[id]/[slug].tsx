import * as React from 'react';
import { ReactElement } from 'react';
import { GetStaticPathsResult, GetStaticPropsResult } from 'next';
import { BasicArtist } from '../../../api/minarets/types/BasicArtist';
import { Artists } from '../../../api/minarets';
import { ArtistIdAndName } from '../../../api/minarets/types/ArtistIdAndName';
import { slugify } from '../../../api/stringService';
import Layout from '../../../components/Layout';

interface IProps {
  artist: BasicArtist;
}

export default function Page({ artist }: IProps): ReactElement {
  return (
    <Layout title={artist.name}>
      <p>{artist.name}</p>
    </Layout>
  );
}

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

export async function getStaticProps({ params }: IParams): Promise<GetStaticPropsResult<IProps>> {
  const api = new Artists();
  const artist = await api.getArtist(params.id);

  return {
    props: {
      artist,
    },
  };
}
