import { BasicPlaylist } from './BasicPlaylist';
import { BasicUser } from './BasicUser';
import { TrackWithExtendedInformation } from './TrackWithExtendedInformation';

export interface Playlist extends BasicPlaylist {
  createdBy: BasicUser;
  description: string;
  trackCount: number;
  tracks: TrackWithExtendedInformation[];
}
