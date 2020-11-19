import type { BasicArtist } from './BasicArtist';
import type { BasicTour } from './BasicTour';
import type { BasicVenue } from './BasicVenue';
import type { ConcertSummary } from './ConcertSummary';

export interface BasicConcert extends ConcertSummary {
  id: string;
  notes: string;
  artist: BasicArtist;
  tour: BasicTour;
  venue: BasicVenue;
  favoriteCount: number;
  playCount: number;
  qualityRatingCount: number;
  qualityRating: number;
}
