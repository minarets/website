import type { BasicArtist } from '../minarets/types/BasicArtist';

export type LimitedArtist = Pick<BasicArtist, 'abbr' | 'id' | 'name'>;
