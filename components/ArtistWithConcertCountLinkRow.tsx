import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Artist } from '../api/minarets/types/Artist';
import { slugify } from '../api/stringService';

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
