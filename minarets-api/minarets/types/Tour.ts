import type { BasicTour } from './BasicTour';

export interface Tour extends BasicTour {
  parentId?: number;
  concertCount: number;
}
