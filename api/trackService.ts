import { v4 as uuid } from 'uuid';

import { getConcertName, getConcertUrl } from './concertService';
import type { TrackWithExtendedInformation } from './minarets/types';
import { slugify } from './stringService';
import type { PlaybackTrack } from './types';

export function getPlaybackTrack(track: TrackWithExtendedInformation): PlaybackTrack {
  const concertUrl = getConcertUrl(track.concert);
  return {
    id: track.id,
    uniqueId: uuid(),
    url: track.url,
    name: track.name,
    duration: track.duration,
    artist: {
      name: track.concert.artist.name,
      url: `/artists/${track.concert.artist.id}/${slugify(track.concert.artist.name)}`,
    },
    album: {
      id: track.concert.id,
      name: getConcertName(track.concert),
      imageUrl: track.concert.posterUrl ? `https://meetattheshow.com${track.concert.posterUrl}` : '',
      url: concertUrl,
    },
  };
}
