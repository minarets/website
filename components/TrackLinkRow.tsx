import Link from 'next/link';
import * as React from 'react';

import type { Track } from '../minarets-api/minarets/types';
import { getTrackNotes } from '../minarets-api/trackService';
import styles from '../styles/components/TrackLinkRow.module.scss';

interface IProps {
  concertUrl?: string;
  concertName?: string;
  artistUrl?: string;
  concertAdditionalDetailsByToken: Record<string, string>;
  track: Track;
  trackNumber?: number;
}

function TrackLinkRow({ artistUrl, concertUrl, concertName, concertAdditionalDetailsByToken, track, trackNumber }: IProps): JSX.Element {
  const trackNotes = getTrackNotes(track, concertAdditionalDetailsByToken);
  const hasTrackNotes = trackNotes.firstTimePlayedText || trackNotes.notes;

  // TODO: Add hover to row to show play button, for non-touch devices. Otherwise, replace track number with play button
  // If touch, then entire track name & notes block is clickable to play
  // TODO: Add swipe right to add to queue. Swipe left to heart?
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#Using_the_Clipboard_API
  return (
    <div className={styles.trackRow}>
      <div className="d-none d-lg-block">{!!trackNumber && <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{trackNumber}</span>}</div>
      <div className="text-truncate">
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
        <div className="text-truncate">
          <Link href={concertUrl}>
            <a>{concertName}</a>
          </Link>
        </div>
      )}
      <div className="text-end d-none">
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
      <div className="d-none d-lg-block text-end">
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
