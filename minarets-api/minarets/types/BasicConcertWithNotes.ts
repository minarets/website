import type { BasicConcert } from './BasicConcert';

export interface BasicConcertWithNotes extends BasicConcert {
  notes: string;
}
