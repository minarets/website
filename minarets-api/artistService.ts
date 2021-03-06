import type { ArtistSummary } from './minarets/types';
import { slugify } from './stringService';

export function getArtistUrl(artist: ArtistSummary): string {
  return `/artists/${artist.id}/${slugify(artist.name)}`;
}
