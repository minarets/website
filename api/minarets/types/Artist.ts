import { BasicArtist } from './BasicArtist';

export interface Artist extends BasicArtist {
  url: string;
  concert_count: number;
}
