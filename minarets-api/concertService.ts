import moment from 'moment';

import type { BasicConcert, BasicConcertWithNotes, Concert, ConcertSummary } from './minarets/types';
import { slugify } from './stringService';

interface IExtractTokenDetailsFromConcertNoteResult {
  noteLines: string[];
  detailsByToken: Record<string, string>;
}

export function getConcertName(concert: Pick<BasicConcert, 'date' | 'name'>): string {
  const concertDate = moment.utc(concert.date);

  return `${concertDate.format('yyyy-MM-DD')} - ${concert.name}`;
}

export function getConcertTitle(concert: BasicConcert): string {
  return `${getConcertName(concert)} - ${concert.artist.name}`;
}

export function getConcertDescription(concert: BasicConcert): string {
  let alternateVenueName = '';
  if (concert.name !== concert.venue.name) {
    alternateVenueName = ` (${concert.venue.name})`;
  }

  const concertDate = moment.utc(concert.date);
  return `${concert.artist.name} concert at ${concert.name}${alternateVenueName} on ${concertDate.format('MMMM d, YYYY')}`;
}

export function getConcertKeywords(concert: BasicConcert): string {
  const concertDate = moment.utc(concert.date);
  return `${concert.artist.name},${concert.artist.abbr},concert,show,${concert.name !== concert.venue.name ? `${concert.name},` : ''}${concert.venue.name},${concertDate.format(
    'MMMM,YYYY,YYYY-MM-DD',
  )}`;
}

export function getConcertUrl(concert: ConcertSummary): string {
  if (!concert) {
    return '';
  }

  const concertDate = moment.utc(concert.date);
  return `/concerts/${concertDate.format('yyyy')}/${concertDate.format('MM')}/${concertDate.format('DD')}/${slugify(concert.name)}`;
}

export function extractTokenDetailsFromConcertNote(concert: Pick<BasicConcertWithNotes, 'notes'>): IExtractTokenDetailsFromConcertNoteResult {
  const detailsByToken: Record<string, string> = {};
  const noteLines: string[] = [];
  for (const line of (concert.notes || '').trim().split('\n')) {
    let isToken = false;
    const trimmedLine = line.trim();
    const token = trimmedLine[0];
    switch (token) {
      case '!':
      case '@':
      case '#':
      case '$':
      case '%':
      case '^':
      case '&':
      case '*':
      case '+':
      case '~': {
        const collaborator = trimmedLine
          .slice(1)
          .replace(/^\s*with\s+/i, '')
          .trim();

        // Remove notes like "Dave on piano" or "Talking Heads cover"
        if (/^(?:dave|dave\s+matthews)\s+on\s+/i.test(collaborator) || /.*\s+cover$/i.test(collaborator)) {
          detailsByToken[token] = '';
        } else {
          const collaboratorMatches = /^(.*)(\s+on\s+.*)/gi.exec(collaborator);
          if (collaboratorMatches && collaboratorMatches.length) {
            detailsByToken[token] = collaboratorMatches[1];
          } else {
            detailsByToken[token] = collaborator;
          }
        }

        isToken = true;
        break;
      }
      default: {
        const entireShowMatches = /^\s*entire\s+(?:show|set)\s+with\s+(.*)/i.exec(trimmedLine);
        if (entireShowMatches && entireShowMatches.length) {
          const collaborator = entireShowMatches[1].replace(/\s+on\s+.*/i, '').replace(/\.+$/, '');

          if (detailsByToken.allTracks) {
            detailsByToken.allTracks += `, ${collaborator}`;
          } else {
            detailsByToken.allTracks = `${collaborator}`;
          }
          isToken = true;
        }
        break;
      }
    }

    if (!isToken && (noteLines.length || trimmedLine)) {
      noteLines.push(trimmedLine);
    }
  }

  return {
    noteLines,
    detailsByToken,
  };
}

export function toSearchRecord(concert: Concert): Record<string, unknown> {
  const concertDate = moment.utc(concert.date);
  return {
    objectID: concert.id,
    name: `${concertDate.format('yyyy-MM-DD')} - ${concert.name}`,
    venue: concert.venue.name,
    tour: concert.tour.name,
    date: concertDate.format('yyyy-MM-DD'),
    dateTimestamp: Number(concertDate.format('X')),
    artist: concert.artist.name,
    playCount: concert.playCount,
    notes: concert.notes,
    tracks: concert.tracks.filter((track) => !/^intro/i.test(track.name)).map((track) => track.name),
    url: getConcertUrl(concert),
  };
}
