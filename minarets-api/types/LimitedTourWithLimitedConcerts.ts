import type { LimitedConcert } from './LimitedConcert';
import type { LimitedTour } from './LimitedTour';

export interface LimitedTourWithLimitedConcerts {
  tour: LimitedTour;
  concerts: LimitedConcert[];
}
