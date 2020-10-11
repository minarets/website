import { BasicArtist } from './BasicArtist';
import { BasicTour } from './BasicTour';
import { BasicVenue } from './BasicVenue';

export interface BasicConcert {
  id: string;
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
