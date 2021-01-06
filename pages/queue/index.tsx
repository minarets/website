import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import QueueTrackLinkRow from '../../components/QueueTrackLinkRow';
import { usePlayerState } from '../../contexts/PlayerContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Page(): ReactElement {
  const title = 'Play Queue';
  useDocumentTitle(title);
  const playerState = usePlayerState();

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <nav>
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
      </nav>

      {!!playerState.currentTrack && (
        <section className="card mb-3">
          <h4 className="card-header">Now Playing</h4>
          <div className="card-body">
            <QueueTrackLinkRow track={playerState.currentTrack} />
          </div>
        </section>
      )}

      {!!playerState.priorityTracks.length && (
        <section className="card mb-3">
          <h4 className="card-header">Next In Queue</h4>
          <div className="card-body">
            {playerState.priorityTracks.map((track) => (
              <QueueTrackLinkRow track={track} key={track.uniqueId} />
            ))}
          </div>
        </section>
      )}

      {!!playerState.nextTracks.length && (
        <section className="card">
          <h4 className="card-header">Next Up</h4>
          <div className="card-body">
            {playerState.nextTracks.map((track) => (
              <QueueTrackLinkRow track={track} key={track.uniqueId} />
            ))}
          </div>
        </section>
      )}

      {!playerState.currentTrack && !playerState.priorityTracks.length && !playerState.nextTracks.length && (
        <section className="card">
          <div className="card-body">Doesn&apos;t look like you have any songs queued up.</div>
        </section>
      )}
    </>
  );
}
