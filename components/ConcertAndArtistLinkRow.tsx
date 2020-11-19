import moment from 'moment';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { getConcertUrl } from '../api/concertService';
import { slugify } from '../api/stringService';
import type { LimitedArtist } from '../api/types/LimitedArtist';
import type { LimitedConcert } from '../api/types/LimitedConcert';

interface IProps {
  artist: LimitedArtist;
  concert: LimitedConcert;
}

function ConcertAndArtistLinkRow({ artist, concert }: IProps): ReactElement {
  const concertDate = moment.utc(concert.date);
  return (
    <div className="row">
      <div className="col-3 col-sm-2 col-lg-1">
        <Link href={`/artists/${artist.id}/${slugify(artist.name)}`}>
          <a title={artist.name}>{artist.abbr}</a>
        </Link>
      </div>
      <div className="col">
        <Link href={getConcertUrl(concert)}>
          <a>
            {concertDate.format('yyyy-MM-DD')}: {concert.name}
          </a>
        </Link>
      </div>
    </div>
  );
}

export default ConcertAndArtistLinkRow;
