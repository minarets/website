import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Artist } from '../minarets-api/minarets/types';
import { slugify } from '../minarets-api/stringService';

interface IProps {
  artist: Pick<Artist, 'concertCount' | 'id' | 'name'>;
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
