import type { BasicTour } from './BasicTour';

export interface BasicTourWithChildren extends BasicTour {
  children: BasicTour[];
}
