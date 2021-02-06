import Link from 'next/link';
import * as React from 'react';

// async function getPlaylists(): Promise<PlaylistSummary[]> {
//   const response = await fetch('/api/minarets/getMyPlaylists');
//   if (response.ok) {
//     const result = (await response.json()) as ListAllResponse<PlaylistSummary>;
//     return result.items;
//   }
//
//   console.log(`getPlaylist - :(`);
//   return [];
// }

export default function MainMenu(): React.ReactElement {
  // TODO: Add playlist dropdown menu
  // const [session] = useSession();
  // const chatState = useChatState();
  // const [playlists, setPlaylists] = React.useState<PlaylistSummary[]>([]);
  //
  // React.useEffect(() => {
  //   if (session) {
  //     getPlaylists()
  //       .then((playlistSummaries) => {
  //         setPlaylists(playlistSummaries);
  //
  //         return playlistSummaries;
  //       })
  //       .catch((err) => Sentry.captureException(err));
  //   }
  // }, [session, setPlaylists]);

  return (
    <nav>
      <ul className="nav">
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
          {/*{!!playlists.length && (
              <ul className="nav flex-column">
                {playlists.map((playlist) => (
                  <li className="nav-item ps-2" key={playlist.id}>
                    <Link href={`/playlists/${playlist.id}/${slugify(playlist.name)}`}>
                      <a className="nav-link">{playlist.name}</a>
                    </Link>
                  </li>
                ))}
              </ul>
            )}*/}
        </li>
        <li className="nav-item">
          <Link href="/compilations">
            <a className="nav-link">Compilations</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
