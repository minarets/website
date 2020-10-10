import { BasicConcert } from '../minarets/types/BasicConcert';
import { Tour } from '../minarets/types/Tour';

export interface TourWithConcerts {
  tour: Tour;
  concerts: BasicConcert[];
}
