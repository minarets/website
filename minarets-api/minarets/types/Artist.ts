import type { BasicArtist } from './BasicArtist';

export interface Artist extends BasicArtist {
  concertCount: number;
}
