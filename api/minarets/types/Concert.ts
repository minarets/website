import type { BasicConcertWithNotes } from './BasicConcertWithNotes';
import type { Track } from './Track';
import type { Venue } from './Venue';

export interface Concert extends BasicConcertWithNotes {
  venue: Venue;
  trackCount: number;
  tracks: Track[];
  recordingInformation: string;
  dmbalmanacUrl: string;
  downloadUrl: string;
  youtubeId: string;
  posterUrl: string;
}
