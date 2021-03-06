import moment from 'moment';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { getArtistUrl } from '../minarets-api/artistService';
import { getConcertUrl } from '../minarets-api/concertService';
import type { LimitedArtist, LimitedConcert } from '../minarets-api/types';
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
        <Link href={getArtistUrl(artist)}>
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
