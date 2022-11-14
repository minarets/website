import * as Sentry from '@sentry/browser';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as React from 'react';

import { useChatState } from '../contexts/ChatContext';
import type { ListAllResponse, PlaylistSummary } from '../minarets-api/minarets/types';
import { getPlaylistUrl } from '../minarets-api/playlistService';

import ChatWidget from './ChatWidget';

async function getPlaylists(): Promise<PlaylistSummary[]> {
  const response = await axios.get<ListAllResponse<PlaylistSummary>>('/api/minarets/getMyPlaylists');
  return response.data.items;
}

export default function SideBarMenu(): JSX.Element {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const chatState = useChatState();
  const [playlists, setPlaylists] = React.useState<PlaylistSummary[]>([]);

  React.useEffect(() => {
    if (isAuthenticated) {
      getPlaylists()
        .then((playlistSummaries) => {
          setPlaylists(playlistSummaries);

          return playlistSummaries;
        })
        .catch((err) => Sentry.captureException(err));
    }
  }, [isAuthenticated, setPlaylists]);

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
          {/*
          {!isAuthenticated && (
            <li className="nav-item">
              <Link href="/chat">
                <a className="nav-link">Chat</a>
              </Link>
            </li>
          )}
*/}
        </ul>
      </nav>
      {isAuthenticated && chatState.isWidgetVisible && <ChatWidget />}
    </>
  );
}
