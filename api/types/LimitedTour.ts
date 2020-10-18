import type { Tour } from '../minarets/types/Tour';

export type LimitedTour = Pick<Tour, 'id' | 'name' | 'parentId' | 'slug'>;
