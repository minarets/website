import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import Layout from '../../components/Layout';
import QueueTrackLinkRow from '../../components/QueueTrackLinkRow';
import { usePlayerState } from '../../contexts/PlayerContext';

export default function Page(): ReactElement {
  const playerState = usePlayerState();

  return (
    <Layout title="Play Queue">
      <section>
        <ul className="nav">
          <li className="nav-item">
            <Link href="/queue">
              <a className="nav-link active">Queue</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/queue/history">
              <a className="nav-link">History</a>
            </Link>
          </li>
        </ul>

        {!!playerState.currentTrack && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Now Playing</h2>
            </div>
            <div className="card-body">
              <QueueTrackLinkRow track={playerState.currentTrack} />
            </div>
          </div>
        )}

        {!!playerState.priorityTracks.length && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Next In Queue</h2>
            </div>
            <div className="card-body">
              {playerState.priorityTracks.map((track) => (
                <QueueTrackLinkRow track={track} key={track.uniqueId} />
              ))}
            </div>
          </div>
        )}

        {!!playerState.nextTracks.length && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Next Up</h2>
            </div>
            <div className="card-body">
              {playerState.nextTracks.map((track) => (
                <QueueTrackLinkRow track={track} key={track.uniqueId} />
              ))}
            </div>
          </div>
        )}

        {!playerState.currentTrack && !playerState.priorityTracks.length && !playerState.nextTracks.length && (
          <div className="card">
            <div className="card-body">Doesn&apos;t look like you have any songs queued up.</div>
          </div>
        )}
      </section>
    </Layout>
  );
}
