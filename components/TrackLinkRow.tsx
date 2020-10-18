import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Track } from '../api/minarets/types/Track';

interface IProps {
  concertUrl?: string;
  artistUrl?: string;
  concertAdditionalDetailsByToken: Record<string, string>;
  track: Track;
  trackNumber: number;
}

function TrackLinkRow({ artistUrl, concertUrl, concertAdditionalDetailsByToken, track, trackNumber }: IProps): ReactElement {
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

  // TODO: Add hover to row to show play button, for non-touch devices. Otherwise, replace track number with play button
  // If touch, then entire track name & notes block is clickable to play
  // TODO: Add swipe right to add to queue. Swipe left to heart?
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#Using_the_Clipboard_API
  return (
    <div className="row">
      <div className="d-none d-sm-flex col-sm-2 col-lg-1">
        <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{trackNumber}</span>
      </div>
      <div className="col text-truncate">
        <div>{trackName}</div>
        {hasTrackNotes && (
          <div>
            {firstTimePlayedText && <small className="pr-4">&#9733; {firstTimePlayedText}</small>}
            {joinedTrackNotes && <small>{joinedTrackNotes}</small>}
          </div>
        )}
      </div>
      <div className="col-3 col-sm-2 col-lg-1 text-right">
        <span>...</span>
        <div className="track-menu">
          <ul className="navbar-nav mr-auto mb-2 mb-lg-0">
            {/*<li className="nav-item">Add to Queue</li>
            <li className="nav-item">Add to Playlist</li>
            <li className="nav-item">Remove from this Playlist</li>*/}
            <li className="nav-item">Copy Song Link</li>
            {concertUrl && (
              <li className="nav-item">
                <Link href={concertUrl}>
                  <a className="nav-link">View Concert</a>
                </Link>
              </li>
            )}
            {artistUrl && (
              <li className="nav-item">
                <Link href={artistUrl}>
                  <a className="nav-link">View Artist</a>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="d-none d-sm-block col-sm-2 col-lg-1 text-right">
        <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{track.duration}</span>
      </div>
    </div>
  );
}

TrackLinkRow.defaultProps = {
  concertUrl: '',
  artistUrl: '',
};

export default TrackLinkRow;
