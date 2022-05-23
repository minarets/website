import { useSession } from 'next-auth/react';
import Link from 'next/link';
import * as React from 'react';
import ReactSlider from 'react-slider';

import { usePlayerDispatch, usePlayerState } from '../contexts/PlayerContext';
import { getTimeDisplay } from '../minarets-api/Player';
import styles from '../styles/PlayerMobileFull.module.scss';

export default function PlayerMobileFull(): React.ReactElement | null {
  const { status: authStatus } = useSession();
  const isAuthenticated = authStatus === 'authenticated';
  const playerState = usePlayerState();
  const playerDispatch = usePlayerDispatch();
  const [seekTime, setSeekTime] = React.useState<number | null>(null);

  function getPlaybackTime(): string {
    if (seekTime != null) {
      return getTimeDisplay(seekTime);
    }

    return getTimeDisplay(playerState.currentTime);
  }

  function handleTrackSeek(value: number[] | number | null | undefined): void {
    if (value == null) {
      return;
    }

    let valueAsNumber: number;
    if (Array.isArray(value)) {
      if (value.length) {
        valueAsNumber = value[0];
      } else {
        return;
      }
    } else {
      valueAsNumber = value;
    }

    setSeekTime(valueAsNumber);
  }

  function handleTrackProgressChange(value: number[] | number | null | undefined): void {
    setSeekTime(null);
    if (value == null) {
      return;
    }

    let valueAsNumber: number;
    if (Array.isArray(value)) {
      if (value.length) {
        [valueAsNumber] = value;
      } else {
        return;
      }
    } else {
      valueAsNumber = value;
    }

    playerState.player.seek(valueAsNumber);
  }

  function handleCloseFullPlayerClick(): void {
    playerDispatch({
      type: 'HideFullPlayer',
    });
  }

  if (!isAuthenticated || !playerState.currentTrack) {
    return null;
  }

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-fullscreen">
        <div className={`modal-content ${styles.modalContent}`}>
          <div className="modal-header">
            <button type="button" aria-label="Close" onClick={handleCloseFullPlayerClick}>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 129 129">
                <g>
                  <path d="m121.3,34.6c-1.6-1.6-4.2-1.6-5.8,0l-51,51.1-51.1-51.1c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l53.9,53.9c0.8,0.8 1.8,1.2 2.9,1.2 1,0 2.1-0.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2 0.1-5.8z" />
                </g>
              </svg>
            </button>
          </div>
          <div className="modal-body">
            <div className={styles.playerContent}>
              <div className={styles.playerArt}>
                {!!playerState.currentTrack.album.imageUrl && <img className="img-fluid" src={playerState.currentTrack.album.imageUrl} alt={playerState.currentTrack.album.name} />}
              </div>
              <div className={styles.nowPlaying}>
                <div className="text-truncate flex-grow-1">
                  <div className={styles.trackName}>
                    <Link href={playerState.currentTrack.album.url}>
                      <a>{playerState.currentTrack.name}</a>
                    </Link>
                  </div>
                  <div className={styles.trackDetails}>
                    <div>
                      <Link href={playerState.currentTrack.album.url}>
                        <a>{playerState.currentTrack.album.name}</a>
                      </Link>
                    </div>
                    <div>
                      <Link href={playerState.currentTrack.artist.url}>
                        <a>{playerState.currentTrack.artist.name}</a>
                      </Link>
                    </div>
                    {playerState.currentTrack.notes && <div>{playerState.currentTrack.notes}</div>}
                    {playerState.currentTrack.firstTimePlayedText && <div>&#9733; {playerState.currentTrack.firstTimePlayedText}</div>}
                  </div>
                </div>

                <div className={styles.playerControls}>
                  <div className={styles.playbackBar}>
                    <ReactSlider
                      ariaLabel="Player progress"
                      className="react-slider"
                      max={playerState.currentTrack && Number.isFinite(playerState.duration) ? playerState.duration : 100}
                      value={playerState.currentTrack && Number.isFinite(playerState.currentTime) ? playerState.currentTime : 0}
                      onChange={(value: number): void => handleTrackSeek(value)}
                      onAfterChange={(value: number): void => handleTrackProgressChange(value)}
                    />
                  </div>
                  <div className={styles.playbackTime}>
                    <div>{getPlaybackTime()}</div>
                    <div>{getTimeDisplay(playerState.currentTrack ? playerState.duration : 0)}</div>
                  </div>

                  <div className={styles.playerControlsButtons}>
                    {/*{false && !player.isShuffleEnabled && (
                        <button title="Enable shuffle" type="button" onClick={(): void => playerDispatch({ type: 'EnableShuffle' })}>
                          <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                            <path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z" />
                          </svg>
                        </button>
                      )}
                      {false && player.isShuffleEnabled && (
                        <button title="Disable shuffle" type="button" onClick={(): void => playerDispatch({ type: 'DisableShuffle' })}>
                          <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                            <path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z" />
                          </svg>
                        </button>
                      )}*/}
                    <button title="Previous" type="button" className={styles.controlButton} onClick={(): Promise<void> => playerState.player.previousTrack()}>
                      <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                        <path d="M13 2.5L5 7.119V3H3v10h2V8.881l8 4.619z" />
                      </svg>
                    </button>
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
                    <button title="Next" type="button" className={styles.controlButton} onClick={(): Promise<void> => playerState.player.nextTrack()}>
                      <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                        <path d="M11 3v4.119L3 2.5v11l8-4.619V13h2V3z" />
                      </svg>
                    </button>
                    {/*{!player.isRepeatOneEnabled && !player.isRepeatEnabled && (
                        <button title="Enable repeat" type="button" onClick={(): void => playerDispatch({ type: 'EnableRepeat' })}>
                          <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                            <path d="M10.989 9.99q-1.871 0-3.481 0.951t-2.561 2.561-0.951 3.481q0 1.395 0.603 2.601l-1.808 0.999q-0.793-1.602-0.793-3.6 0-2.458 1.197-4.527t3.267-3.267 4.527-1.197h8.991v-2.997l6.993 3.996-6.993 3.996v-2.997h-8.991M29.177 13.384q0.793 1.602 0.793 3.6 0 2.458-1.197 4.527t-3.267 3.267-4.527 1.197h-8.991v2.997l-6.993-3.996 6.993-3.996v2.997h8.991q1.871 0 3.481-0.951t2.561-2.561 0.951-3.481q0-1.395-0.603-2.601l1.808-0.999z" />
                          </svg>
                        </button>
                      )}
                      {!player.isRepeatOneEnabled && player.isRepeatEnabled && (
                        <button title="Enable repeat one" type="button" onClick={(): void => playerDispatch({ type: 'EnableRepeatOne' })}>
                          <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                            <path d="M5.5 5H10v1.5l3.5-2-3.5-2V4H5.5C3 4 1 6 1 8.5c0 .6.1 1.2.4 1.8l.9-.5C2.1 9.4 2 9 2 8.5 2 6.6 3.6 5 5.5 5zm9.1 1.7l-.9.5c.2.4.3.8.3 1.3 0 1.9-1.6 3.5-3.5 3.5H6v-1.5l-3.5 2 3.5 2V13h4.5C13 13 15 11 15 8.5c0-.6-.1-1.2-.4-1.8z" />
                          </svg>
                        </button>
                      )}
                      {player.isRepeatOneEnabled && !player.isRepeatEnabled && (
                        <button title="Disable repeat" type="button" onClick={(): void => playerDispatch({ type: 'DisableRepeat' })}>
                          <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                            <path d="M9.99 9.958q-2.585 0.46-4.289 2.394t-1.705 4.599q0 1.395 0.603 2.601l-1.808 0.999q-0.793-1.602-0.793-3.6 0-2.252 1.078-4.218t2.902-3.219 4.012-1.554v1.998M20.979 23.945q2.997 0 5.391-2.394 1.506-0.301 2.997-1.205-0.698 1.617-1.935 2.87t-2.918 1.99-3.536 0.737h-8.991v2.997l-6.993-3.996 6.993-3.996v2.997h8.991M18.45 1.165q0 0 1.035-0.599t3.493-0.599 4.527 1.197 3.267 3.267 1.197 4.527-1.197 4.527-3.267 3.267-4.527 1.197-4.527-1.197-3.267-3.267-1.197-4.527 1.197-4.527 3.267-3.267M24.769 13.954h-0.19v-10.783h-2.204v0.19q0 0.396-0.19 0.603 0 0.206-0.412 0.603-0.143 0.143-0.396 0.27t-0.396 0.127q-0.143 0.143-0.293 0.174t-0.5 0.032h-0.206v1.998h2.204v6.787h2.585z" />
                          </svg>
                        </button>
                      )}*/}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
