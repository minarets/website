import { useSession } from 'next-auth/client';
import Link from 'next/link';
import * as React from 'react';
import ReactSlider from 'react-slider';

import { usePlayerDispatch, usePlayerState } from '../contexts/PlayerContext';
import { getTimeDisplay } from '../minarets-api/Player';
import styles from '../styles/PlayerDesktop.module.scss';

export default function PlayerMobileFull(): React.ReactElement {
  const [session] = useSession();
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

  return (
    <>
      {!!session && playerState.currentTrack && (
        <div className="modal show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="btn-close text-reset" aria-label="Close" onClick={handleCloseFullPlayerClick} />
              </div>
              <div className="modal-body">
                <h1>
                  <Link href={playerState.currentTrack.album.url}>
                    <a>{playerState.currentTrack.name}</a>
                  </Link>
                </h1>
                <h4 className="modal-title">
                  <Link href={playerState.currentTrack.album.url}>
                    <a>{playerState.currentTrack.album.name}</a>
                  </Link>
                </h4>
                <h4>
                  <Link href={playerState.currentTrack.artist.url}>
                    <a>{playerState.currentTrack.artist.name}</a>
                  </Link>
                </h4>
                <div className={styles.playbackBar}>
                  <ReactSlider
                    ariaLabel="Player progress"
                    className="react-slider"
                    max={playerState.currentTrack && Number.isFinite(playerState.duration) ? playerState.duration : 100}
                    value={playerState.currentTrack && Number.isFinite(playerState.currentTime) ? playerState.currentTime : 0}
                    onChange={handleTrackSeek}
                    onAfterChange={handleTrackProgressChange}
                  />
                </div>
                <div className={styles.playbackTime}>
                  <div>{getPlaybackTime()}</div>
                  <div>{getTimeDisplay(playerState.currentTrack ? playerState.duration : 0)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
