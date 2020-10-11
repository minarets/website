import { BasicArtist } from './BasicArtist';
import { BasicTour } from './BasicTour';
import { BasicVenue } from './BasicVenue';

export interface BasicConcert {
  id: number;
  name: string;
  date: string;
  artist: BasicArtist;
  tour: BasicTour;
  venue: BasicVenue;
  favoriteCount: number;
  playCount: number;
  qualityRatingCount: number;
  qualityRating: number;
}
