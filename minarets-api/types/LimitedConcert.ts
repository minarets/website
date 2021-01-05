import type { BasicConcert } from '../minarets/types';

export type LimitedConcert = Pick<BasicConcert, 'date' | 'id' | 'name'>;
