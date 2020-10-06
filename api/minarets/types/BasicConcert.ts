import { BasicArtist } from './BasicArtist';
import { BasicTour } from './BasicTour';
import { BasicVenue } from './BasicVenue';

export interface BasicConcert {
  id: string;
  name: string;
  date: Date;
  artist: BasicArtist;
  tour: BasicTour;
  venue: BasicVenue;
  favorite_count: number;
  play_count: number;
  quality_rating_count: number;
  quality_rating: number;
}
