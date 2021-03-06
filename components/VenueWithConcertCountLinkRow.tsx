import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Venue } from '../minarets-api/minarets/types';
import { getVenueUrl } from '../minarets-api/venueService';

interface IProps {
  venue: Venue;
}

function VenueWithConcertCountLinkRow({ venue }: IProps): ReactElement {
  return (
    <div className="row">
      <div className="col">
        <Link href={getVenueUrl(venue)}>
          <a title={venue.name}>
            {venue.name} ({venue.concertCount} concerts)
          </a>
        </Link>
      </div>
    </div>
  );
}

export default VenueWithConcertCountLinkRow;
