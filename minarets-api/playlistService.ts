import type { PlaylistSummary } from './minarets/types';
import { slugify } from './stringService';

export function getPlaylistUrl(playlist: PlaylistSummary): string {
  return `/playlists/${playlist.id}/${slugify(playlist.name)}`;
}
