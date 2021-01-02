import moment from 'moment';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { getConcertUrl } from '../api/concertService';
import { slugify } from '../api/stringService';
import type { LimitedArtist, LimitedConcert } from '../api/types';
import styles from '../styles/ConcertAndArtistLinkRow.module.scss';

interface IProps {
  artist: LimitedArtist;
  concert: LimitedConcert;
}

function ConcertAndArtistLinkRow({ artist, concert }: IProps): ReactElement {
  const concertDate = moment.utc(concert.date);
  return (
    <div className={styles.row}>
      <div className={styles.artist}>
        <Link href={`/artists/${artist.id}/${slugify(artist.name)}`}>
          <a title={artist.name}>{artist.abbr}</a>
        </Link>
      </div>
      <div className={styles.concert}>
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
