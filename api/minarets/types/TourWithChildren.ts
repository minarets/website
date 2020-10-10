import { Tour } from './Tour';

export interface TourWithChildren extends Tour {
  children: Tour[];
}
