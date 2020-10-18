import moment from 'moment';

import type { BasicConcert } from './minarets/types/BasicConcert';
import type { BasicConcertWithNotes } from './minarets/types/BasicConcertWithNotes';
import { slugify } from './stringService';

interface IExtractTokenDetailsFromConcertNoteResult {
  noteLines: string[];
  detailsByToken: Record<string, string>;
}

export function getConcertUrl(concert: Pick<BasicConcert, 'date' | 'name'>): string {
  if (!concert) {
    return '';
  }

  const concertDate = moment(concert.date);
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
