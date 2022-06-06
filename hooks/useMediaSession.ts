import { useEffect, useMemo } from 'react';

interface MediaSessionProps extends MediaMetadataInit, MediaPositionState {
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (params: Pick<MediaSessionActionDetails, 'fastSeek' | 'seekTime'>) => void;
  onPreviousTrack: () => void;
  onNextTrack: () => void;
}

export function useMediaSession({ title, album, artist, artwork, isPaused, duration, playbackRate, position, onPlay, onPause, onSeek, onPreviousTrack, onNextTrack }: MediaSessionProps): void {
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

    if (duration) {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate,
        position,
      });
    } else {
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
