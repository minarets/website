import { useCallback } from 'react';

import { usePlayerState } from '../contexts/PlayerContext';
import { useMediaSession } from '../hooks/useMediaSession';

export default function PlayerNativeControls(): JSX.Element | null {
  const playerState = usePlayerState();

  useMediaSession({
    title: playerState.currentTrack?.name,
    album: playerState.currentTrack?.album.name,
    artist: playerState.currentTrack?.artist.name,
    artwork: playerState.currentTrack?.album.imageUrl ? [{ src: playerState.currentTrack?.album.imageUrl }] : undefined,
    position: playerState.currentTime,
    isPaused: playerState.isPaused,
    duration: playerState.duration,
    onPlay: useCallback(() => {
      playerState.player.play();
    }, [playerState.player]),
    onPause: useCallback(() => {
      playerState.player.pause();
    }, [playerState.player]),
    onPreviousTrack: useCallback(() => {
      playerState.player.previousTrack();
    }, [playerState.player]),
    onNextTrack: useCallback(() => {
      playerState.player.nextTrack();
    }, [playerState.player]),
    onSeek: useCallback(
      (params) => {
        if (params.seekTime != null) {
          playerState.player.seek(params.seekTime);
        }
      },
      [playerState.player],
    ),
  });

  return null;
}
