import type { Tour } from './Tour';

export interface TourWithChildren extends Tour {
  children: Tour[];
}
