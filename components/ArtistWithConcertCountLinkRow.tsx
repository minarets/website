import * as React from 'react';
import Link from 'next/link';
import { ReactElement } from 'react';
import { slugify } from '../api/stringService';
import { Artist } from '../api/minarets/types/Artist';

interface IProps {
  artist: Artist;
}

function ArtistWithConcertCountLinkRow({ artist }: IProps): ReactElement {
  return (
    <div className="row">
      <div className="col">
        <Link href={`/artists/${artist.id}/${slugify(artist.name)}`}>
          <a title={artist.name}>
            {artist.name} ({artist.concertCount} concerts)
          </a>
        </Link>
      </div>
    </div>
  );
}

export default ArtistWithConcertCountLinkRow;
