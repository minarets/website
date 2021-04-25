import { useSession } from 'next-auth/client';
import Head from 'next/head';
import * as React from 'react';

import { usePlayerState } from '../contexts/PlayerContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type { PlaybackTrack, PlaybackTrackAlbum } from '../minarets-api/types';

import PlayerDesktop from './PlayerDesktop';

export default function Player(): React.ReactElement {
  const [session] = useSession();
  const playerState = usePlayerState();

  function uniqueTracksById(tracks: readonly (PlaybackTrack | undefined)[]): PlaybackTrack[] {
    const result: PlaybackTrack[] = [];
    const isUnique: Record<string, boolean> = {};
    for (const track of tracks) {
      if (track && !isUnique[track.id]) {
        isUnique[track.id] = true;
        result.push(track);
      }
    }

    return result;
  }

  function uniqueAlbumsWithImageUrlFromTracks(tracks: readonly (PlaybackTrack | undefined)[]): PlaybackTrackAlbum[] {
    const result: PlaybackTrackAlbum[] = [];
    const isUnique: Record<string, boolean> = {};
    for (const track of tracks) {
      if (track && track.album.imageUrl && !isUnique[track.album.id]) {
        isUnique[track.album.id] = true;
        result.push(track.album);
      }
    }

    return result;
  }

  const isMobile = useMediaQuery('(max-width: 991px)');

  return (
    <>
      {!!session && (
        <>
          <Head>
            {uniqueTracksById([playerState.currentTrack, ...playerState.priorityTracks, ...playerState.nextTracks.slice(0, 2)]).map((track) => (
              <link rel="preload" href={track.url} as="audio" key={`preload-audio-${track.id}`} />
            ))}
            {uniqueAlbumsWithImageUrlFromTracks([playerState.currentTrack, ...playerState.priorityTracks, ...playerState.nextTracks.slice(0, 2)]).map((album) => (
              <link rel="preload" href={album.imageUrl} as="image" key={`preload-art-${album.id}`} />
            ))}
          </Head>
          {!isMobile && <PlayerDesktop />}
        </>
      )}
    </>
  );
}
