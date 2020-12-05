import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { getConcertUrl } from '../../api/concertService';
import { slugify } from '../../api/stringService';
import Layout from '../../components/Layout';
import TrackLinkRow from '../../components/TrackLinkRow';
import { usePlayer } from '../../hooks/usePlayer';

export default function Page(): ReactElement {
  const { currentTrack, queueItems } = usePlayer();

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
            <Link href="/history">
              <a className="nav-link">History</a>
            </Link>
          </li>
        </ul>

        {!!currentTrack && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Now Playing</h2>
            </div>
            <div className="card-body">
              <TrackLinkRow
                concertAdditionalDetailsByToken={currentTrack.detailsByToken} //
                track={currentTrack}
                concertUrl={getConcertUrl(currentTrack.concert)}
                artistUrl={`/artists/${currentTrack.concert.artist.id}/${slugify(currentTrack.concert.artist.name)}`}
              />
            </div>
          </div>
        )}

        {!!queueItems.length && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Next up</h2>
            </div>
            <div className="card-body">
              {queueItems.map((track) => (
                <TrackLinkRow
                  concertAdditionalDetailsByToken={track.detailsByToken} //
                  track={track}
                  concertUrl={getConcertUrl(track.concert)}
                  artistUrl={`/artists/${track.concert.artist.id}/${slugify(track.concert.artist.name)}`}
                  key={track.queueId}
                />
              ))}
            </div>
          </div>
        )}

        {!currentTrack && !queueItems.length && (
          <div className="card">
            <div className="card-body">Doesn&apos;t look like you have any songs queued up.</div>
          </div>
        )}
      </section>
    </Layout>
  );
}
