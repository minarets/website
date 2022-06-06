import { useSession } from 'next-auth/react';
import * as React from 'react';
import ReactSlider from 'react-slider';

import { usePlayerState, usePlayerDispatch } from '../contexts/PlayerContext';
import styles from '../styles/PlayerMobile.module.scss';

export default function PlayerMobile(): JSX.Element | null {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const playerState = usePlayerState();
  const playerDispatch = usePlayerDispatch();

  function handleNowPlayingBarClick(): void {
    playerDispatch({
      type: 'ShowFullPlayer',
    });
  }

  const hasTrackNotes = playerState.currentTrack && (playerState.currentTrack.firstTimePlayedText || playerState.currentTrack.notes);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.playerBar} dir="ltr" role="complementary">
      {playerState.currentTrack && (
        <div className="flex-shrink-1">
          <ReactSlider
            ariaLabel="Player progress"
            className={`react-slider ${styles.progressBarMinimized}`}
            max={playerState.currentTrack && Number.isFinite(playerState.duration) ? playerState.duration : 100}
            value={playerState.currentTrack && Number.isFinite(playerState.currentTime) ? playerState.currentTime : 0}
            disabled
          />
        </div>
      )}

      <div className={styles.nowPlayingBar}>
        {playerState.currentTrack && (
          <div className={styles.nowPlayingBarCenter} onClick={handleNowPlayingBarClick} onKeyPress={handleNowPlayingBarClick} role="button" tabIndex={0}>
            <div className={styles.trackTitle}>
              <span className={styles.trackName}>{playerState.currentTrack.name} - </span>
              <span className={styles.albumName}>{playerState.currentTrack.album.name}</span>
            </div>
            {hasTrackNotes && (
              <small className={styles.trackDetails}>
                <span>{playerState.currentTrack.artist.abbr} - </span>
                {playerState.currentTrack.firstTimePlayedText && <span className="pe-4">&#9733; {playerState.currentTrack.firstTimePlayedText}</span>}
                {playerState.currentTrack.notes && <span>{playerState.currentTrack.notes}</span>}
              </small>
            )}
            {!hasTrackNotes && <small className={styles.trackDetails}>{playerState.currentTrack.artist.name}</small>}
          </div>
        )}
        {!playerState.currentTrack && <div className={styles.nowPlayingBarCenter} />}
        <div className={styles.nowPlayingBarRight}>
          {playerState.isPaused && (
            <button title="Play" type="button" className={styles.playPause} disabled={!playerState.currentTrack} onClick={(): void => playerState.player.play()}>
              <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                <path d="M4.018 14L14.41 8 4.018 2z" />
              </svg>
            </button>
          )}
          {!playerState.isPaused && (
            <button title="Pause" type="button" className={styles.playPause} onClick={(): void => playerState.player.pause()}>
              <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                <path fill="none" d="M0 0h16v16H0z" />
                <path d="M3 2h3v12H3zM10 2h3v12h-3z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
