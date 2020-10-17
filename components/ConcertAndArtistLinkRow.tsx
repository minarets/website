import moment from 'moment';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { BasicConcert } from '../api/minarets/types/BasicConcert';
import { slugify } from '../api/stringService';

interface IProps {
  compact?: boolean;
  concert: BasicConcert;
}

function ConcertAndArtistLinkRow({ compact, concert }: IProps): ReactElement {
  const concertDate = moment(concert.date);
  return (
    <div className="row">
      <div className={compact ? 'col-2' : 'col-1'}>
        <Link href={`/artists/${concert.artist.id}/${slugify(concert.artist.name)}`}>
          <a title={concert.artist.name}>{concert.artist.abbr}</a>
        </Link>
      </div>
      <div className="col">
        <Link href={`/concerts/${concertDate.format('yyyy')}/${concertDate.format('MM')}/${concertDate.format('DD')}/${slugify(concert.name)}`}>
          <a>
            {concertDate.format('yyyy-MM-DD')}: {concert.name}
          </a>
        </Link>
      </div>
    </div>
  );
}

ConcertAndArtistLinkRow.defaultProps = {
  compact: false,
};

export default ConcertAndArtistLinkRow;
