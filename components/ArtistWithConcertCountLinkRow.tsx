import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { getArtistUrl } from '../minarets-api/artistService';
import type { Artist } from '../minarets-api/minarets/types';

interface IProps {
  artist: Pick<Artist, 'concertCount' | 'id' | 'name'>;
}

function ArtistWithConcertCountLinkRow({ artist }: IProps): ReactElement {
  return (
    <div className="row">
      <div className="col">
        <Link href={getArtistUrl(artist)}>
          <a title={artist.name}>
            {artist.name} ({artist.concertCount} concerts)
          </a>
        </Link>
      </div>
    </div>
  );
}

export default ArtistWithConcertCountLinkRow;
