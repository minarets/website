import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { PlaybackTrack } from '../api/types';

interface IProps {
  track: PlaybackTrack;
  trackNumber?: number;
}

function QueueTrackLinkRow({ track, trackNumber }: IProps): ReactElement {
  // TODO: Add hover to row to show play button, for non-touch devices. Otherwise, replace track number with play button
  // If touch, then entire track name & notes block is clickable to play
  // TODO: Add swipe right to add to queue. Swipe left to heart?
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Interact_with_the_clipboard#Using_the_Clipboard_API
  return (
    <div className="row">
      <div className="d-none d-sm-flex col-sm-2 col-lg-1">{!!trackNumber && <span className="align-middle">{trackNumber}</span>}</div>
      <div className="col text-truncate">{track.name}</div>
      <div className="col text-truncate">
        <Link href={track.album.url}>
          <a>{track.album.name}</a>
        </Link>
      </div>
      <div className="d-none d-sm-block col-sm-2 col-lg-1 text-end">
        <span className="align-middle">{track.duration}</span>
      </div>
      <div className="col-3 col-sm-2 col-lg-1 text-end d-none">
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
    </div>
  );
}

QueueTrackLinkRow.defaultProps = {
  trackNumber: undefined,
};

export default QueueTrackLinkRow;
