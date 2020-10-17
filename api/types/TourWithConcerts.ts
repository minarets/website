import type { BasicConcert } from '../minarets/types/BasicConcert';
import type { Tour } from '../minarets/types/Tour';

export interface TourWithConcerts {
  tour: Tour;
  concerts: BasicConcert[];
}
