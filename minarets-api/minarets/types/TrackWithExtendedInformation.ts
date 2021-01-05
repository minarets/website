import type { BasicConcert } from './BasicConcert';
import type { Track } from './Track';

export interface TrackWithExtendedInformation extends Track {
  concert: BasicConcert;
}
