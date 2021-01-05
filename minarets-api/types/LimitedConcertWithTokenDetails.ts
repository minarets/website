import type { LimitedConcert } from './LimitedConcert';

export type LimitedConcertWithTokenDetails = LimitedConcert & {
  tokenDetails: Record<string, string>;
};
