import { useEffect } from 'react';

interface MediaSessionProps extends MediaMetadataInit, MediaPositionState {
  onPlay: () => void;
  onPause: () => void;
  onSeek: (params: Pick<MediaSessionActionDetails, 'fastSeek' | 'seekTime'>) => void;
  onSeekBackward: (params: Pick<MediaSessionActionDetails, 'seekOffset'>) => void;
  onSeekForward: (params: Pick<MediaSessionActionDetails, 'seekOffset'>) => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
}

export function useMediaSession(params: MediaSessionProps): void {
  // Update track metadata
  useEffect(() => {
    if (navigator.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: params.title,
        album: params.album,
        artist: params.artist,
        artwork: params.artwork,
      });
    }
  }, [params.title, params.album, params.artist, params.artwork]);

  // Update playback position
  useEffect(() => {
    if (!navigator.mediaSession) {
      return;
    }

    if (params.duration) {
      navigator.mediaSession.setPositionState({
        duration: params.duration,
        playbackRate: params.playbackRate,
        position: params.position,
      });
    } else {
      // Reset position
      navigator.mediaSession.setPositionState();
    }
  }, [params.duration, params.playbackRate, params.position]);

  // Hook all the events
  useEffect(() => {
    navigator.mediaSession?.setActionHandler('play', params.onPlay);

    return () => {
      navigator.mediaSession?.setActionHandler('play', null);
    };
  }, [params.onPlay]);
  useEffect(() => {
    navigator.mediaSession?.setActionHandler('pause', params.onPause);

    return () => {
      navigator.mediaSession?.setActionHandler('pause', null);
    };
  }, [params.onPause]);
  useEffect(() => {
    navigator.mediaSession?.setActionHandler('seekto', params.onSeek);

    return () => {
      navigator.mediaSession?.setActionHandler('seekto', null);
    };
  }, [params.onSeek]);
  useEffect(() => {
    navigator.mediaSession?.setActionHandler('seekbackward', params.onSeekBackward);

    return () => {
      navigator.mediaSession?.setActionHandler('seekbackward', null);
    };
  }, [params.onSeekBackward]);
  useEffect(() => {
    navigator.mediaSession?.setActionHandler('seekforward', params.onSeekForward);

    return () => {
      navigator.mediaSession?.setActionHandler('seekforward', null);
    };
  }, [params.onSeekForward]);
  useEffect(() => {
    navigator.mediaSession?.setActionHandler('previoustrack', params.onPreviousTrack);

    return () => {
      navigator.mediaSession?.setActionHandler('previoustrack', null);
    };
  }, [params.onPreviousTrack]);
  useEffect(() => {
    navigator.mediaSession?.setActionHandler('nexttrack', params.onNextTrack);

    return () => {
      navigator.mediaSession?.setActionHandler('nexttrack', null);
    };
  }, [params.onNextTrack]);
}
