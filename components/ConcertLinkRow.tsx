import moment from 'moment';
import Link from 'next/link';
import * as React from 'react';

import { getConcertUrl } from '../minarets-api/concertService';
import type { BasicConcert } from '../minarets-api/minarets/types';

interface IProps {
  concert: Pick<BasicConcert, 'date' | 'name'>;
}

function ConcertLinkRow({ concert }: IProps): JSX.Element {
  const concertDate = moment.utc(concert.date);
  return (
    <div className="row">
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

export default ConcertLinkRow;
