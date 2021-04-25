import { useSession } from 'next-auth/client';
import * as React from 'react';
import ReactSlider from 'react-slider';

import { usePlayerState } from '../contexts/PlayerContext';
import styles from '../styles/PlayerMobile.module.scss';

export default function PlayerMobile(): React.ReactElement {
  const [session] = useSession();
  const playerState = usePlayerState();

  function handleNowPlayingBarClick(): void {
    console.log('Open nowPlayingModal');
  }

  return (
    <>
      {!!session && (
        <div className={styles.playerBar} dir="ltr" role="complementary">
          <div className="flex-shrink-1">
            <ReactSlider
              ariaLabel="Player progress"
              className={`react-slider ${styles.progressBarMinimized}`}
              max={playerState.currentTrack && Number.isFinite(playerState.duration) ? playerState.duration : 100}
              value={playerState.currentTrack && Number.isFinite(playerState.currentTime) ? playerState.currentTime : 0}
              disabled
            />
          </div>

          <div className={styles.nowPlayingBar}>
            <div className={styles.nowPlayingBarCenter} onClick={handleNowPlayingBarClick} onKeyPress={handleNowPlayingBarClick} role="button" tabIndex={0}>
              {playerState.currentTrack && (
                <div className="text-truncate">
                  {playerState.currentTrack.name} - {playerState.currentTrack.album.name}
                </div>
              )}
            </div>
            <div className={styles.nowPlayingBarRight}>
              {playerState.isPaused && (
                <button title="Play" type="button" className={styles.playPause} disabled={!playerState.currentTrack} onClick={(): Promise<void> => playerState.player.play()}>
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
      )}
    </>
  );
}
