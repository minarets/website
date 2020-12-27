import { useSession } from 'next-auth/client';
import Link from 'next/link';
import * as React from 'react';

import type { ListAllResponse, PlaylistSummary } from '../api/minarets/types';
import { slugify } from '../api/stringService';

async function getPlaylists(): Promise<PlaylistSummary[]> {
  const response = await fetch('/api/minarets/getMyPlaylists');
  if (response.ok) {
    const result = (await response.json()) as ListAllResponse<PlaylistSummary>;
    return result.items;
  }

  console.log(`getPlaylist - :(`);
  return [];
}

export default function Layout(): React.ReactElement {
  const [session] = useSession();
  const [playlists, setPlaylists] = React.useState<PlaylistSummary[]>([]);
  const setPlaylistsCb = React.useCallback((items: PlaylistSummary[]) => {
    setPlaylists(items);
  }, []);

  React.useEffect(() => {
    if (session) {
      getPlaylists()
        .then(setPlaylistsCb)
        .catch((err) => console.error(err));
    }
  }, [session, setPlaylistsCb]);

  return (
    <div className="position-sticky pt-3">
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
                <li className="nav-item pl-2" key={playlist.id}>
                  <Link href={`/playlists/${playlist.id}/${slugify(playlist.name)}`}>
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
        <li className="nav-item">
          <Link href="/chat">
            <a className="nav-link">Chat</a>
          </Link>
        </li>
      </ul>
    </div>
  );
}
