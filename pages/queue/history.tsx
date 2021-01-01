import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import Layout from '../../components/Layout';
import QueueTrackLinkRow from '../../components/QueueTrackLinkRow';
import { usePlayerState } from '../../contexts/PlayerContext';

export default function Page(): ReactElement {
  const { historyTracks } = usePlayerState();

  return (
    <Layout title="Play Queue">
      <section>
        <ul className="nav">
          <li className="nav-item">
            <Link href="/queue">
              <a className="nav-link">Queue</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/history">
              <a className="nav-link active">History</a>
            </Link>
          </li>
        </ul>

        {!!historyTracks.length && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Played Songs</h2>
            </div>
            <div className="card-body">
              {historyTracks.map((track) => (
                <QueueTrackLinkRow track={track} key={track.uniqueId} />
              ))}
            </div>
          </div>
        )}

        {!historyTracks.length && (
          <div className="card">
            <div className="card-body">Doesn&apos;t look like you have played any songs.</div>
          </div>
        )}
      </section>
    </Layout>
  );
}
