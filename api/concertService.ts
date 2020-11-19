import moment from 'moment';

import type { BasicConcert } from './minarets/types/BasicConcert';
import type { BasicConcertWithNotes } from './minarets/types/BasicConcertWithNotes';
import type { ConcertSummary } from './minarets/types/ConcertSummary';
import { slugify } from './stringService';

interface IExtractTokenDetailsFromConcertNoteResult {
  noteLines: string[];
  detailsByToken: Record<string, string>;
}

export function getConcertTitle(concert: BasicConcert): string {
  const concertDate = moment.utc(concert.date);

  return `${concertDate.format('yyyy-MM-DD')} - ${concert.name} - ${concert.artist.name}`;
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
  let hasMoreTokens = true;
  for (const line of (concert.notes || '').trim().split('\n')) {
    let isToken = false;
    const trimmedLine = line.trim();
    if (hasMoreTokens && trimmedLine) {
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
          detailsByToken[token] = trimmedLine.slice(1).trim();
          isToken = true;
          break;
        default:
          hasMoreTokens = false;
          break;
      }
    } else if (hasMoreTokens) {
      hasMoreTokens = false;
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
