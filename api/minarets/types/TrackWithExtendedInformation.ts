import { Track } from './Track';
import { BasicConcert } from './BasicConcert';

export interface TrackWithExtendedInformation extends Track {
  concert: BasicConcert;
}
