import * as React from 'react';
import Link from 'next/link';
import { ReactElement } from 'react';
import moment from 'moment';
import { BasicConcert } from '../api/minarets/types/BasicConcert';
import { slugify } from '../api/stringService';

interface IProps {
  concert: BasicConcert;
}

function ConcertLinkRow({ concert }: IProps): ReactElement {
  const concertDate = moment(concert.date);
  return (
    <div className="row">
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

export default ConcertLinkRow;
