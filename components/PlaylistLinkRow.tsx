import Link from 'next/link';
import * as React from 'react';
import type { ReactElement } from 'react';

import type { Playlist } from '../api/minarets/types';
import { slugify } from '../api/stringService';

interface IProps {
  playlist: Pick<Playlist, 'id' | 'name'>;
}

function PlaylistLinkRow({ playlist }: IProps): ReactElement {
  return (
    <div className="row">
      <div className="col">
        <Link href={`/playlists/${playlist.id}/${slugify(playlist.name)}`}>
          <a title={playlist.name}>{playlist.name}</a>
        </Link>
      </div>
    </div>
  );
}

export default PlaylistLinkRow;
