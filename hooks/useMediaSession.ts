import { useEffect, useMemo } from 'react';

export interface MediaSessionProps extends MediaMetadataInit, MediaPositionState {
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (params: Pick<MediaSessionActionDetails, 'fastSeek' | 'seekTime'>) => void;
  onSeekBackward: (params: Pick<MediaSessionActionDetails, 'seekOffset'>) => void;
  onSeekForward: (params: Pick<MediaSessionActionDetails, 'seekOffset'>) => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
}

export function useMediaSession({
  title,
  album,
  artist,
  artwork,
  isPaused,
  duration,
  playbackRate,
  position,
  onPlay,
  onPause,
  onSeek,
  onSeekBackward,
  onSeekForward,
  onPreviousTrack,
  onNextTrack,
}: MediaSessionProps): void {
  const artworkUrl = useMemo(() => {
    if (artwork && artwork.length) {
      return artwork[0].src;
    }

    return undefined;
  }, [artwork]);

  // Update track metadata
  useEffect(() => {
    if (navigator.mediaSession) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        album,
        artist,
        artwork: artworkUrl ? [{ src: artworkUrl }] : undefined,
      });
    }
  }, [title, album, artist, artworkUrl]);

  useEffect(() => {
    if (navigator.mediaSession) {
      navigator.mediaSession.playbackState = isPaused ? 'paused' : 'playing';
    }
  }, [isPaused]);

  // Update playback position
  useEffect(() => {
    if (!navigator.mediaSession) {
      return;
    }

    if (duration && position && position <= duration) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate,
        position,
      });
    } else if (!duration) {
      // Reset position
      navigator.mediaSession.setPositionState();
    }
  }, [duration, playbackRate, position]);

  // Hook all the events
  useEffect(() => {
    try {
      navigator.mediaSession?.setActionHandler('play', onPlay);
    } catch (ex) {
      console.error(ex);
    }

    return () => {
      try {
        navigator.mediaSession?.setActionHandler('play', null);
      } catch (ex) {
        console.error(ex);
      }
    };
  }, [onPlay]);
  useEffect(() => {
    try {
      navigator.mediaSession?.setActionHandler('pause', onPause);
    } catch (ex) {
      console.error(ex);
    }

    return () => {
      try {
        navigator.mediaSession?.setActionHandler('pause', null);
      } catch (ex) {
        console.error(ex);
      }
    };
  }, [onPause]);
  useEffect(() => {
    try {
      navigator.mediaSession?.setActionHandler('seekto', onSeek);
    } catch (ex) {
      console.error(ex);
    }

    return () => {
      try {
        navigator.mediaSession?.setActionHandler('seekto', null);
      } catch (ex) {
        console.error(ex);
      }
    };
  }, [onSeek]);
  useEffect(() => {
    console.log('Seek back setup');
    try {
      navigator.mediaSession?.setActionHandler('seekbackward', onSeekBackward);
    } catch (ex) {
      console.error(ex);
    }

    return () => {
      try {
        navigator.mediaSession?.setActionHandler('seekbackward', null);
      } catch (ex) {
        console.error(ex);
      }
    };
  }, [onSeekBackward]);
  useEffect(() => {
    console.log('Seek forward setup');
    try {
      navigator.mediaSession?.setActionHandler('seekforward', onSeekForward);
    } catch (ex) {
      console.error(ex);
    }

    return () => {
      try {
        navigator.mediaSession?.setActionHandler('seekforward', null);
      } catch (ex) {
        console.error(ex);
      }
    };
  }, [onSeekForward]);
  useEffect(() => {
    try {
      navigator.mediaSession?.setActionHandler('previoustrack', onPreviousTrack);
    } catch (ex) {
      console.error(ex);
    }

    return () => {
      try {
        navigator.mediaSession?.setActionHandler('previoustrack', null);
      } catch (ex) {
        console.error(ex);
      }
    };
  }, [onPreviousTrack]);
  useEffect(() => {
    try {
      navigator.mediaSession?.setActionHandler('nexttrack', onNextTrack);
    } catch (ex) {
      console.error(ex);
    }

    return () => {
      try {
        navigator.mediaSession?.setActionHandler('nexttrack', null);
      } catch (ex) {
        console.error(ex);
      }
    };
  }, [onNextTrack]);
}
