import { useCallback } from 'react';

import { usePlayerState, usePlayerDispatch } from '../contexts/PlayerContext';
import type { MediaSessionProps } from '../hooks/useMediaSession';
import { useMediaSession } from '../hooks/useMediaSession';

export default function PlayerNativeControls(): JSX.Element | null {
  const playerState = usePlayerState();
  const playerDispatch = usePlayerDispatch();

  const onPlay = useCallback(() => {
    playerState.player.play();
  }, [playerState.player]);
  const onPause = useCallback(() => {
    playerState.player.pause();
  }, [playerState.player]);
  const onPreviousTrack = useCallback(() => {
    playerState.player.previousTrack();
  }, [playerState.player]);
  const onNextTrack = useCallback(() => {
    playerState.player.nextTrack();
  }, [playerState.player]);
  const onSeek = useCallback(
    (params: Parameters<MediaSessionProps['onSeek']>[0]) => {
      if (params.seekTime != null) {
        playerDispatch({
          type: 'Seek',
          position: params.seekTime,
        });
      }
    },
    [playerDispatch],
  );
  const onSeekForward = useCallback(
    (params: Parameters<MediaSessionProps['onSeekForward']>[0]) => {
      playerDispatch({
        type: 'SeekBy',
        offset: Math.abs(params.seekOffset || 10),
      });
    },
    [playerDispatch],
  );
  const onSeekBackward = useCallback(
    (params: Parameters<MediaSessionProps['onSeekBackward']>[0]) => {
      playerDispatch({
        type: 'SeekBy',
        offset: -1 * Math.abs(params.seekOffset || 10),
      });
    },
    [playerDispatch],
  );

  useMediaSession({
    title: playerState.currentTrack?.name,
    album: playerState.currentTrack?.album.name,
    artist: playerState.currentTrack?.artist.name,
    artwork: playerState.currentTrack?.album.imageUrl ? [{ src: playerState.currentTrack?.album.imageUrl }] : undefined,
    position: playerState.currentTime,
    isPaused: playerState.isPaused,
    duration: playerState.duration,
    onPlay,
    onPause,
    onPreviousTrack,
    onNextTrack,
    onSeek,
    onSeekForward,
    onSeekBackward,
  });

  return null;
}
