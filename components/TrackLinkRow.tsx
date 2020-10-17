import * as React from 'react';
import type { ReactElement } from 'react';

import type { Track } from '../api/minarets/types/Track';

interface IProps {
  concertAdditionalDetailsByToken: Record<string, string>;
  track: Track;
  trackNumber: number;
}

function TrackLinkRow({ concertAdditionalDetailsByToken, track, trackNumber }: IProps): ReactElement {
  let trackName = track.name;
  let firstTimePlayedText: string | undefined;
  const trackNotes: string[] = [];
  if (concertAdditionalDetailsByToken) {
    for (const char of track.additionalInfo || '') {
      const trackNote = concertAdditionalDetailsByToken[char];
      if (trackNote) {
        if (/^first\s+time/gi.test(trackNote)) {
          firstTimePlayedText = trackNote;
        } else {
          trackNotes.push(trackNote);
        }
      } else {
        trackName += ` ${char}`;
      }
    }
  }

  const joinedTrackNotes = trackNotes.join(', ');
  const hasTrackNotes = firstTimePlayedText || joinedTrackNotes;

  return (
    <div className="row">
      <div className="col-2 col-sm-2 col-lg-1">
        <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{trackNumber}</span>
      </div>
      <div className="col">
        <div>
          <span className={hasTrackNotes ? 'align-top' : ''}>{trackName}</span>
        </div>
        {hasTrackNotes && (
          <div>
            {firstTimePlayedText && <small className="pr-4">&#9733; {firstTimePlayedText}</small>}
            {joinedTrackNotes && <small>{joinedTrackNotes}</small>}
          </div>
        )}
      </div>
      <div className="col-2 col-sm-2 col-lg-1 text-right">
        <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{track.duration}</span>
      </div>
    </div>
  );
}

export default TrackLinkRow;
