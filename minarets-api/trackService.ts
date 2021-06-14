import { v4 as uuid } from 'uuid';

import { getConcertName, getConcertUrl } from './concertService';
import type { Track, TrackWithExtendedInformation } from './minarets/types';
import { slugify } from './stringService';
import type { PlaybackTrack } from './types';

interface GetTrackNotesResult {
  firstTimePlayedText: string;
  notes: string;
  trackNameSuffix: string;
}

export function getTrackNotes(track: Track, concertAdditionalDetailsByToken: Record<string, string>): GetTrackNotesResult {
  const result: GetTrackNotesResult = {
    firstTimePlayedText: '',
    notes: '',
    trackNameSuffix: '',
  };
  const trackNotes: string[] = [];

  for (const char of track.additionalInfo || '') {
    const trackNote = concertAdditionalDetailsByToken[char];
    if (trackNote != null) {
      if (/^first\s+time/gi.test(trackNote)) {
        result.firstTimePlayedText = trackNote;
      } else if (trackNote) {
        trackNotes.push(trackNote);
      }
    } else if (char === '-') {
      // skip
    } else {
      result.trackNameSuffix += ` ${char}`;
    }
  }

  if (concertAdditionalDetailsByToken.allTracks) {
    trackNotes.push(concertAdditionalDetailsByToken.allTracks);
  }

  result.notes = trackNotes.join(', ');

  return result;
}

export function getPlaybackTrack(track: TrackWithExtendedInformation, concertAdditionalDetailsByToken: Record<string, string>): PlaybackTrack {
  const concertUrl = getConcertUrl(track.concert);
  const trackNotes = getTrackNotes(track, concertAdditionalDetailsByToken);
  return {
    id: track.id,
    uniqueId: uuid(),
    url: track.url,
    name: track.name,
    trackNameSuffix: trackNotes.trackNameSuffix,
    firstTimePlayedText: trackNotes.firstTimePlayedText,
    notes: trackNotes.notes,
    duration: track.duration,
    artist: {
      name: track.concert.artist.name,
      abbr: track.concert.artist.abbr,
      url: `/artists/${track.concert.artist.id}/${slugify(track.concert.artist.name)}`,
    },
    album: {
      id: track.concert.id,
      name: getConcertName(track.concert),
      imageUrl: track.concert.posterUrl ? `https://api.minarets.io${track.concert.posterUrl}` : '',
      url: concertUrl,
    },
  };
}
