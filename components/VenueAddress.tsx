import * as React from 'react';
import type { ReactElement } from 'react';

import type { Venue } from '../api/minarets/types/Venue';

interface IProps {
  venue: Venue;
}

function VenueAddress({ venue }: IProps): ReactElement {
  let { formattedAddress } = venue;
  if (!formattedAddress) {
    formattedAddress = venue.city || '';
    if (venue.city && venue.state) {
      formattedAddress += ', ';
    }

    if (venue.state) {
      formattedAddress += venue.state;
    }

    if (formattedAddress && venue.country && venue.country !== 'United States' && venue.country !== 'US') {
      formattedAddress += ` ${venue.country}`;
    }

    if (venue.postalCode) {
      if (formattedAddress) {
        formattedAddress += ' ';
      }

      formattedAddress += venue.postalCode;
    }

    if (venue.address) {
      formattedAddress = `${venue.address}\n${formattedAddress}`;
    }
  }

  return (
    <span>
      <div>{venue.name}</div>
      <div className="preLineWhiteSpace">{formattedAddress}</div>
    </span>
  );
}

export default VenueAddress;
