import * as Sentry from '@sentry/browser';
import { useSession } from 'next-auth/client';
import Link from 'next/link';
import * as React from 'react';

import { useChatState } from '../contexts/ChatContext';
import type { ListAllResponse, PlaylistSummary } from '../minarets-api/minarets/types';
import { getPlaylistUrl } from '../minarets-api/playlistService';

import ChatWidget from './ChatWidget';

async function getPlaylists(): Promise<PlaylistSummary[]> {
  const response = await fetch('/api/minarets/getMyPlaylists');
  if (response.ok) {
    const result = (await response.json()) as ListAllResponse<PlaylistSummary>;
    return result.items;
  }

  console.log(`getPlaylist - :(`);
  return [];
}

export default function SideBarMenu(): React.ReactElement {
  const [session] = useSession();
  const chatState = useChatState();
  const [playlists, setPlaylists] = React.useState<PlaylistSummary[]>([]);

  React.useEffect(() => {
    if (session) {
      getPlaylists()
        .then((playlistSummaries) => {
          setPlaylists(playlistSummaries);

          return playlistSummaries;
        })
        .catch((err) => Sentry.captureException(err));
    }
  }, [session, setPlaylists]);

  return (
    <>
      <nav className="position-sticky pt-3">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link href="/">
              <a className="nav-link">Home</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/concerts">
              <a className="nav-link">Concerts</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/tours">
              <a className="nav-link">Tours</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/artists">
              <a className="nav-link">Artists</a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/playlists">
              <a className="nav-link">Playlists</a>
            </Link>
            {!!playlists.length && (
              <ul className="nav flex-column">
                {playlists.map((playlist) => (
                  <li className="nav-item ps-2" key={playlist.id}>
                    <Link href={getPlaylistUrl(playlist)}>
                      <a className="nav-link">{playlist.name}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className="nav-item">
            <Link href="/compilations">
              <a className="nav-link">Compilations</a>
            </Link>
          </li>
          {!session && (
            <li className="nav-item">
              <Link href="/chat">
                <a className="nav-link">Chat</a>
              </Link>
            </li>
          )}
        </ul>
      </nav>
      {!!session && chatState.isWidgetVisible && <ChatWidget />}
    </>
  );
}
