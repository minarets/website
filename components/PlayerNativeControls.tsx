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
    playbackRate: 1,
    duration: playerState.duration,
    onPlay() {
      playerState.player.play();
    },
    onPause() {
      playerState.player.pause();
    },
    onPreviousTrack() {
      playerState.player.previousTrack();
    },
    onNextTrack() {
      playerState.player.nextTrack();
    },
    onSeek(params) {
      if (params.seekTime != null) {
        playerState.player.seek(params.seekTime);
      }
    },
    onSeekForward(params) {
      if (params.seekOffset != null) {
        playerState.player.seek(Math.min(playerState.currentTime + params.seekOffset, playerState.duration));
      } else {
        playerState.player.seek(Math.min(playerState.currentTime + 15, playerState.duration));
      }
    },
    onSeekBackward(params) {
      if (params.seekOffset != null) {
        playerState.player.seek(Math.max(playerState.currentTime - params.seekOffset, 0));
      } else {
        playerState.player.seek(Math.max(playerState.currentTime - 15, 0));
      }
    },
  });

  return null;
}
