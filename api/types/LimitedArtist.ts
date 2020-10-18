import type { BasicArtist } from '../minarets/types/BasicArtist';

export type LimitedArtist = Pick<BasicArtist, 'id' | 'name' | 'abbr'>;
