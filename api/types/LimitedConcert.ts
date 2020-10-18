import type { BasicConcert } from '../minarets/types/BasicConcert';

export type LimitedConcert = Pick<BasicConcert, 'id' | 'date' | 'name'>;
