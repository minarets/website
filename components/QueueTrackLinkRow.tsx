import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { PlaybackTrack } from '../minarets-api/types';
import styles from '../styles/components/TrackLinkRow.module.scss';

interface IProps {
  track: PlaybackTrack;
  trackNumber?: number;
}

function QueueTrackLinkRow({ track, trackNumber }: IProps): ReactElement {
  // TODO: Add hover to row to show play button, for non-touch devices. Otherwise, replace track number with play button
  // If touch, then entire track name & notes block is clickable to play
  // TODO: Add swipe right to add to queue. Swipe left to heart?
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#Using_the_Clipboard_API
  const hasTrackNotes = false;

  return (
    <div className={styles.trackRow}>
      <div className="d-none d-lg-block">{!!trackNumber && <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{trackNumber}</span>}</div>
      <div className="text-truncate">{track.name}</div>
      <div className="text-truncate">
        <Link href={track.album.url}>
          <a>{track.album.name}</a>
        </Link>
      </div>
      <div className="text-end d-none">
        <span>...</span>
        <div className="track-menu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">Add to Queue</li>
            <li className="nav-item">
              <Link href={track.album.url}>
                <a className="nav-link">View Concert</a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href={track.artist.url}>
                <a className="nav-link">View Artist</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="d-none d-lg-block text-end">
        <span className={hasTrackNotes ? 'align-top' : 'align-middle'}>{track.duration}</span>
      </div>
    </div>
  );
}

QueueTrackLinkRow.defaultProps = {
  trackNumber: undefined,
};

export default QueueTrackLinkRow;
