import type { VenueSummary } from './minarets/types';
import { slugify } from './stringService';

export function getVenueUrl(venue: VenueSummary): string {
  return `/venues/${venue.id}/${slugify(venue.name)}`;
}
