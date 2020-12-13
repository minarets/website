import { useSession } from 'next-auth/client';
import Link from 'next/link';
import * as React from 'react';

import { usePlayerState, usePlayerDispatch, togglePlayPause } from '../contexts/PlayerContext';
import styles from '../styles/Player.module.scss';

export default function Player(): React.ReactElement {
  const [session] = useSession();
  const player = usePlayerState();
  const playerDispatch = usePlayerDispatch();
  const togglePlayPauseCb = React.useCallback(() => {
    void togglePlayPause(player, playerDispatch);
  }, [player, playerDispatch]);

  function handleTrackSeek(event: React.ChangeEvent<HTMLInputElement>): void {
    if (player.player.currentTrack) {
      player.player.currentTrack.seek(Number(event.target.value || '0'));
    }
  }

  function handleSetVolume(event: React.ChangeEvent<HTMLInputElement>): void {
    playerDispatch({
      type: 'SetVolume',
      volume: Number(event.target.value || '0'),
    });
  }

  return (
    <>
      {!!session && (
        <div className={styles.playerBar}>
          {player.currentTrack && (
            <div>
              <strong>{player.currentTrack.name}</strong>
              <div>
                {player.currentTrack.concert.artist.abbr} :: {player.currentTrack.concert.date}
              </div>
            </div>
          )}
          <div>
            <div className="player-controls">
              {/*{false && !player.isShuffleEnabled && (
                <button className="control-button" title="Enable shuffle" type="button" onClick={(): void => playerDispatch({ type: 'EnableShuffle' })}>
                  <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                    <path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z" />
                  </svg>
                </button>
              )}
              {false && player.isShuffleEnabled && (
                <button className="control-button" title="Disable shuffle" type="button" onClick={(): void => playerDispatch({ type: 'DisableShuffle' })}>
                  <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                    <path d="M4.5 6.8l.7-.8C4.1 4.7 2.5 4 .9 4v1c1.3 0 2.6.6 3.5 1.6l.1.2zm7.5 4.7c-1.2 0-2.3-.5-3.2-1.3l-.6.8c1 1 2.4 1.5 3.8 1.5V14l3.5-2-3.5-2v1.5zm0-6V7l3.5-2L12 3v1.5c-1.6 0-3.2.7-4.2 2l-3.4 3.9c-.9 1-2.2 1.6-3.5 1.6v1c1.6 0 3.2-.7 4.2-2l3.4-3.9c.9-1 2.2-1.6 3.5-1.6z" />
                  </svg>
                </button>
              )}*/}
              <button className="control-button" title="Previous" type="button" onClick={(): void => playerDispatch({ type: 'PreviousTrack' })}>
                <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                  <path d="M13 2.5L5 7.119V3H3v10h2V8.881l8 4.619z" />
                </svg>
              </button>
              {player.isPaused && (
                <button className="control-button" title="Play" type="button" onClick={(): void => togglePlayPauseCb()}>
                  <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                    <path d="M4.018 14L14.41 8 4.018 2z" />
                  </svg>
                </button>
              )}
              {!player.isPaused && (
                <button className="control-button" title="Pause" type="button" onClick={(): void => togglePlayPauseCb()}>
                  <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                    <path fill="none" d="M0 0h16v16H0z" />
                    <path d="M3 2h3v12H3zM10 2h3v12h-3z" />
                  </svg>
                </button>
              )}
              <button className="control-button" title="Next" type="button" onClick={(): void => playerDispatch({ type: 'NextTrack' })}>
                <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                  <path d="M11 3v4.119L3 2.5v11l8-4.619V13h2V3z" />
                </svg>
              </button>
              {/*{!player.isRepeatOneEnabled && !player.isRepeatEnabled && (
                <button className="control-button" title="Enable repeat" type="button" onClick={(): void => playerDispatch({ type: 'EnableRepeat' })}>
                  <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                    <path d="M10.989 9.99q-1.871 0-3.481 0.951t-2.561 2.561-0.951 3.481q0 1.395 0.603 2.601l-1.808 0.999q-0.793-1.602-0.793-3.6 0-2.458 1.197-4.527t3.267-3.267 4.527-1.197h8.991v-2.997l6.993 3.996-6.993 3.996v-2.997h-8.991M29.177 13.384q0.793 1.602 0.793 3.6 0 2.458-1.197 4.527t-3.267 3.267-4.527 1.197h-8.991v2.997l-6.993-3.996 6.993-3.996v2.997h8.991q1.871 0 3.481-0.951t2.561-2.561 0.951-3.481q0-1.395-0.603-2.601l1.808-0.999z" />
                  </svg>
                </button>
              )}
              {!player.isRepeatOneEnabled && player.isRepeatEnabled && (
                <button className="control-button" title="Enable repeat one" type="button" onClick={(): void => playerDispatch({ type: 'EnableRepeatOne' })}>
                  <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                    <path d="M5.5 5H10v1.5l3.5-2-3.5-2V4H5.5C3 4 1 6 1 8.5c0 .6.1 1.2.4 1.8l.9-.5C2.1 9.4 2 9 2 8.5 2 6.6 3.6 5 5.5 5zm9.1 1.7l-.9.5c.2.4.3.8.3 1.3 0 1.9-1.6 3.5-3.5 3.5H6v-1.5l-3.5 2 3.5 2V13h4.5C13 13 15 11 15 8.5c0-.6-.1-1.2-.4-1.8z" />
                  </svg>
                </button>
              )}
              {player.isRepeatOneEnabled && !player.isRepeatEnabled && (
                <button className="control-button" title="Disable repeat" type="button" onClick={(): void => playerDispatch({ type: 'DisableRepeat' })}>
                  <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                    <path d="M9.99 9.958q-2.585 0.46-4.289 2.394t-1.705 4.599q0 1.395 0.603 2.601l-1.808 0.999q-0.793-1.602-0.793-3.6 0-2.252 1.078-4.218t2.902-3.219 4.012-1.554v1.998M20.979 23.945q2.997 0 5.391-2.394 1.506-0.301 2.997-1.205-0.698 1.617-1.935 2.87t-2.918 1.99-3.536 0.737h-8.991v2.997l-6.993-3.996 6.993-3.996v2.997h8.991M18.45 1.165q0 0 1.035-0.599t3.493-0.599 4.527 1.197 3.267 3.267 1.197 4.527-1.197 4.527-3.267 3.267-4.527 1.197-4.527-1.197-3.267-3.267-1.197-4.527 1.197-4.527 3.267-3.267M24.769 13.954h-0.19v-10.783h-2.204v0.19q0 0.396-0.19 0.603 0 0.206-0.412 0.603-0.143 0.143-0.396 0.27t-0.396 0.127q-0.143 0.143-0.293 0.174t-0.5 0.032h-0.206v1.998h2.204v6.787h2.585z" />
                  </svg>
                </button>
              )}*/}
            </div>
            <div className="player-playback">
              <div className="player-progress-time" />
              <input
                type="range"
                className="form-range"
                min="0"
                max={player.player.currentTrack ? player.player.currentTrack.duration : 100}
                disabled={!player.player.currentTrack}
                value={player.player.currentTrack ? player.player.currentTrack.currentTime : 0}
                onChange={handleTrackSeek}
              />
              <div className="player-total-time" />
            </div>
          </div>
          <div>
            <ul>
              <li>
                <Link href="/queue">
                  <a>
                    <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                      <path d="M3.996 4.059l8.595 4.995-8.595 4.995v-9.99M3.996 28.036v-1.998h27.972v1.998h-27.972M3.996 20.044v-1.998h27.972v1.998h-27.972M17.982 10.054h13.986v1.998h-13.986v-1.998z" />
                    </svg>
                  </a>
                </Link>
              </li>
              <li>
                <div className="player-volume">
                  {player.isMuted && (
                    <button className="control-button" title="Unmute" type="button" onClick={(): void => playerDispatch({ type: 'Unmute' })}>
                      <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                        <path d="M0 10.054h5.598l10.387-5.994v23.976l-10.387-5.994h-5.598v-11.988M13.986 7.516l-7.849 4.535h-4.139v7.992h4.139l7.849 4.535v-17.062M31.207 11.75l-4.281 4.297 4.281 4.281-1.411 1.411-4.281-4.281-4.297 4.281-1.411-1.411 4.297-4.281-4.297-4.297 1.411-1.411 4.297 4.297 4.281-4.297 1.411 1.411z" />
                      </svg>
                    </button>
                  )}
                  {!player.isMuted && (
                    <button className="control-button" title="Mute" type="button" onClick={(): void => playerDispatch({ type: 'Mute' })}>
                      <svg role="img" height="16" width="16" viewBox="0 0 16 16">
                        {player.volume < 33 && (
                          <path d="M21.376 10.418q1.094 1.094 1.713 2.553t0.618 3.076q0 1.078-0.285 2.109t-0.801 1.911-1.245 1.61l-1.316-1.538q1.649-1.728 1.649-4.091t-1.649-4.091l1.316-1.538M0 10.054h5.598l10.387-5.994v23.976l-10.387-5.994h-5.598v-11.988M13.986 7.516l-7.849 4.535h-4.139v7.992h4.139l7.849 4.535v-17.062z" />
                        )}
                        {player.volume >= 33 && player.volume < 66 && (
                          <path d="M0 10.054h5.598l10.387-5.994v23.976l-10.387-5.994h-5.598v-11.988M13.986 7.516l-7.849 4.535h-4.139v7.992h4.139l7.849 4.535v-17.062M22.906 19.956q0 0 0.4-0.924t0.4-2.985-0.801-3.909-2.244-3.243l1.316-1.522q1.744 1.665 2.735 3.909t0.991 4.765-0.991 4.765-2.735 3.909l-1.316-1.522q1.443-1.395 2.244-3.243z" />
                        )}
                        {player.volume >= 66 && (
                          <path d="M25.863 2.823q2.743 2.521 4.289 5.946t1.546 7.279-1.546 7.279-4.289 5.946l-1.3-1.522q2.41-2.236 3.774-5.265t1.364-6.438-1.364-6.438-3.774-5.265l1.3-1.522M21.328 8.135q1.047 0.999 1.8 2.236t1.166 2.696 0.412 2.981q0 2.299-0.896 4.345t-2.482 3.568l-1.3-1.522q1.253-1.253 1.966-2.902t0.714-3.489-0.706-3.489-1.974-2.902l1.3-1.522M0 10.054h5.598l10.387-5.994v23.976l-10.387-5.994h-5.598v-11.988M13.986 7.516l-7.849 4.535h-4.139v7.992h4.139l7.849 4.535v-17.062z" />
                        )}
                      </svg>
                    </button>
                  )}

                  <input type="range" className="form-range" min="0" max="100" value={player.volume} onChange={handleSetVolume} />
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
