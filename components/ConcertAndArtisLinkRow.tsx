import * as React from 'react';
import Link from 'next/link';
import { ReactElement } from 'react';
import moment from 'moment';
import { BasicConcert } from '../api/minarets/types/BasicConcert';
import { slugify } from '../api/stringService';

interface IProps {
  compact?: boolean;
  concert: BasicConcert;
}

function ConcertAndLinkRow({ compact, concert }: IProps): ReactElement {
  const concertDate = moment(concert.date);
  return (
    <div className="row">
      <div className={compact ? 'col-2' : 'col-1'}>
        <Link
          href={{
            pathname: '/artists/[id]/[slug]',
            query: {
              id: concert.artist.id,
              slug: slugify(concert.artist.name),
            },
          }}
        >
          <a title={concert.artist.name}>{concert.artist.abbr}</a>
        </Link>
      </div>
      <div className="col">
        <Link
          href={{
            pathname: '/concerts/[year]/[month]/[day]/[slug]',
            query: {
              id: concert.id,
              year: concertDate.format('YYYY'),
              month: concertDate.format('MM'),
              day: concertDate.format('DD'),
              slug: slugify(concert.name),
            },
          }}
        >
          <a>
            {concertDate.format('yyyy-MM-DD')}: {concert.name}
          </a>
        </Link>
      </div>
    </div>
  );
}

ConcertAndLinkRow.defaultProps = {
  compact: false,
};

export default ConcertAndLinkRow;
