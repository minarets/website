import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Venue } from '../api/minarets/types';
import { slugify } from '../api/stringService';

interface IProps {
  venue: Venue;
}

function VenueWithConcertCountLinkRow({ venue }: IProps): ReactElement {
  return (
    <div className="row">
      <div className="col">
        <Link href={`/venues/${venue.id}/${slugify(venue.name)}`}>
          <a title={venue.name}>
            {venue.name} ({venue.concertCount} concerts)
          </a>
        </Link>
      </div>
    </div>
  );
}

export default VenueWithConcertCountLinkRow;
