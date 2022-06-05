import Link from 'next/link';
import * as React from 'react';

import type { Playlist } from '../minarets-api/minarets/types';
import { getPlaylistUrl } from '../minarets-api/playlistService';

interface IProps {
  playlist: Pick<Playlist, 'id' | 'name'>;
}

function PlaylistLinkRow({ playlist }: IProps): JSX.Element {
  return (
    <div className="row">
      <div className="col">
        <Link href={getPlaylistUrl(playlist)}>
          <a title={playlist.name}>{playlist.name}</a>
        </Link>
      </div>
    </div>
  );
}

export default PlaylistLinkRow;
