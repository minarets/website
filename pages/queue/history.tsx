import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import { getConcertUrl } from '../../api/concertService';
import { slugify } from '../../api/stringService';
import Layout from '../../components/Layout';
import TrackLinkRow from '../../components/TrackLinkRow';
import { usePlayer } from '../../hooks/usePlayer';

export default function Page(): ReactElement {
  const { historyItems } = usePlayer();

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

        {!!historyItems.length && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Next up</h2>
            </div>
            <div className="card-body">
              {historyItems.map((track) => (
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

        {!historyItems.length && (
          <div className="card">
            <div className="card-body">Doesn&apos;t look like you have played any songs.</div>
          </div>
        )}
      </section>
    </Layout>
  );
}
