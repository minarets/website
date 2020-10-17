import type { BasicArtist } from './BasicArtist';
import type { BasicTour } from './BasicTour';
import type { BasicVenue } from './BasicVenue';

export interface BasicConcert {
  id: string;
  name: string;
  date: string;
  notes: string;
  artist: BasicArtist;
  tour: BasicTour;
  venue: BasicVenue;
  favoriteCount: number;
  playCount: number;
  qualityRatingCount: number;
  qualityRating: number;
}
