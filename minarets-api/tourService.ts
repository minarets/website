import type { BasicTour } from './minarets/types';
import { slugify } from './stringService';

export function getTourUrl(tour: Pick<BasicTour, 'name'>): string {
  return `/tours/${slugify(tour.name)}`;
}
