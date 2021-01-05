import type { BasicArtist } from '../minarets/types';

import type { LimitedConcert } from './LimitedConcert';

export type LimitedConcertWithArtistId = LimitedConcert & {
  artistId: BasicArtist['id'];
};
