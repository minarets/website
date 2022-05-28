import Head from 'next/head';
import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import QueueTrackLinkRow from '../../components/QueueTrackLinkRow';
import { usePlayerState } from '../../contexts/PlayerContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Page(): ReactElement {
  const title = 'Play History';
  useDocumentTitle(title);
  const { historyTracks } = usePlayerState();

  return (
    <>
      <Head>
        <title>{title} · Minarets</title>
      </Head>

      <nav className="mb-3">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <Link href="/queue">
              <a className="nav-link">Queue</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/queue/history">
              <a className="nav-link active">History</a>
            </Link>
          </li>
        </ul>
      </nav>

      {!!historyTracks.length && (
        <section className="card mb-3">
          <h4 className="card-header">Played Songs</h4>
          <div className="card-body">
            {historyTracks.map((track) => (
              <QueueTrackLinkRow track={track} key={track.uniqueId} />
            ))}
          </div>
        </section>
      )}

      {!historyTracks.length && (
        <section className="card">
          <div className="card-body">Doesn&apos;t look like you have played any songs.</div>
        </section>
      )}
    </>
  );
}
