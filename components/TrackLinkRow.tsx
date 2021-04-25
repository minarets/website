import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Track } from '../minarets-api/minarets/types';
import { getTrackNotes } from '../minarets-api/trackService';

interface IProps {
  concertUrl?: string;
  concertName?: string;
  artistUrl?: string;
  concertAdditionalDetailsByToken: Record<string, string>;
  track: Track;
  trackNumber?: number;
}

function TrackLinkRow({ artistUrl, concertUrl, concertName, concertAdditionalDetailsByToken, track, trackNumber }: IProps): ReactElement {
  const trackNotes = getTrackNotes(track, concertAdditionalDetailsByToken);
  const hasTrackNotes = trackNotes.firstTimePlayedText || trackNotes.notes;

  // TODO: Add hover to row to show play button, for non-touch devices. Otherwise, replace track number with play button
  // If touch, then entire track name & notes block is clickable to play
  // TODO: Add swipe right to add to queue. Swipe left to heart?
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#Using_the_Clipboard_API
  return (
    <div className="row">
      <div className="d-none d-sm-flex col-sm-2 col-lg-1">{!!trackNumber && <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{trackNumber}</span>}</div>
      <div className="col text-truncate">
        <div>
          {track.name}
          {trackNotes.trackNameSuffix}
        </div>
        {hasTrackNotes && (
          <div>
            {trackNotes.firstTimePlayedText && <small className="pe-4">&#9733; {trackNotes.firstTimePlayedText}</small>}
            {trackNotes.notes && <small>{trackNotes.notes}</small>}
          </div>
        )}
      </div>
      {concertUrl && concertName && (
        <div className="d-none d-md-flex col-lg-5 col-xl-3 text-truncate">
          <Link href={concertUrl}>
            <a className="nav-link">{concertName}</a>
          </Link>
        </div>
      )}
      <div className="col-3 col-sm-2 col-lg-1 text-end d-none">
        <span>...</span>
        <div className="track-menu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">Add to Queue</li>
            <li className="nav-item">Add to Playlist</li>
            <li className="nav-item">Remove from Queue</li>
            <li className="nav-item">Remove from this Playlist</li>
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
      <div className="d-none d-sm-block col-sm-2 col-lg-1 text-end">
        <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{track.duration}</span>
      </div>
    </div>
  );
}

TrackLinkRow.defaultProps = {
  concertUrl: '',
  concertName: '',
  artistUrl: '',
  trackNumber: undefined,
};

export default TrackLinkRow;
