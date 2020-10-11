import { Track } from './Track';
import { BasicConcert } from './BasicConcert';

export interface Concert extends BasicConcert {
  trackCount: number;
  tracks: Track[];
  notes: string;
  recordingInformation: string;
  dmbalmanacUrl: string;
  downloadUrl: string;
  youtubeId: string;
  posterUrl: string;
}
