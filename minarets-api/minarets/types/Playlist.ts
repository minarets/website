import type { BasicPlaylist } from './BasicPlaylist';
import type { BasicUser } from './BasicUser';
import type { TrackWithExtendedInformation } from './TrackWithExtendedInformation';

export interface Playlist extends BasicPlaylist {
  createdBy: BasicUser;
  description: string;
  createdOn: string;
  favoriteCount: number;
  trackCount: number;
  tracks: TrackWithExtendedInformation[];
}
