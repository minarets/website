import type { Tour } from '../minarets/types';

export type LimitedTour = Pick<Tour, 'id' | 'name' | 'parentId' | 'slug'>;
