import * as React from 'react';
import Link from 'next/link';
import { ReactElement } from 'react';
import { slugify } from '../api/stringService';
import { Venue } from '../api/minarets/types/Venue';

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
