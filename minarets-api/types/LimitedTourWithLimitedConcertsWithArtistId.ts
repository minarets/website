import type { LimitedConcertWithArtistId } from './LimitedConcertWithArtistId';
import type { LimitedTour } from './LimitedTour';

export interface LimitedTourWithLimitedConcertsWithArtistId {
  tour: LimitedTour;
  concerts: LimitedConcertWithArtistId[];
}
