import type { BasicVenue } from './BasicVenue';

export interface Venue extends BasicVenue {
  concertCount: number;
  formattedAddress: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  website: string;
}
