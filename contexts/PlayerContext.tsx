import * as Sentry from '@sentry/browser';
import * as React from 'react';

import { Player, RepeatMode } from '../minarets-api/Player';
import type { PlaybackTrack } from '../minarets-api/types';

export interface IPlayerState {
  player: Player<PlaybackTrack>;
  currentTrack?: PlaybackTrack;
  currentTime: number;
  duration: number;
  isPaused: boolean;
  isMuted: boolean;
  repeatMode: RepeatMode;
  volume: number;
  priorityTracks: PlaybackTrack[];
  nextTracks: PlaybackTrack[];
  historyTracks: PlaybackTrack[];
}

interface IMuteAction {
  type: 'Mute' | 'Unmute';
}

interface ISetVolumeAction {
  type: 'SetVolume';
  volume: number;
}

interface IProgressAction {
  type: 'Progress';
  currentTime: number;
  duration: number;
}

interface IUpdatePlayerStateAction {
  type: 'UpdatePlayerState';
  state: {
    currentTrack?: PlaybackTrack;
    position: number;
    duration: number;
    isPaused: boolean;
    repeatMode: RepeatMode;
    priorityTracks: PlaybackTrack[];
    nextTracks: PlaybackTrack[];
  };
}

interface ITrackStartEndAction {
  type: 'TrackEnd' | 'TrackStart';
  track: PlaybackTrack;
}

type PlayerAction = IMuteAction | IProgressAction | ISetVolumeAction | ITrackStartEndAction | IUpdatePlayerStateAction;

function playerReducer(state: IPlayerState, action: PlayerAction): IPlayerState {
  try {
    switch (action.type) {
      case 'UpdatePlayerState':
        return {
          ...state,
          currentTrack: action.state.currentTrack,
          currentTime: action.state.position,
          duration: action.state.duration,
          isPaused: action.state.isPaused,
          repeatMode: action.state.repeatMode,
          priorityTracks: action.state.priorityTracks,
          nextTracks: action.state.nextTracks,
        };
      case 'TrackStart': {
        Sentry.addBreadcrumb({
          category: 'Player',
          message: 'TrackStart',
          level: Sentry.Severity.Info,
        });
        fetch(`/api/minarets/playTrack/${action.track.id}`).catch((err) => Sentry.captureException(err));

        return state;
      }
      case 'Progress': {
        return {
          ...state,
          currentTime: action.currentTime,
          duration: action.duration,
        };
      }
      case 'TrackEnd':
        Sentry.addBreadcrumb({
          category: 'Player',
          message: 'TrackEnd',
          level: Sentry.Severity.Info,
        });
        return {
          ...state,
          historyTracks: [action.track, ...state.historyTracks],
        };
      case 'Mute':
      case 'Unmute': {
        if (state.isMuted) {
          Sentry.addBreadcrumb({
            category: 'Player',
            message: 'Unmute',
            level: Sentry.Severity.Info,
          });

          state.player.setVolume(state.volume);
          return {
            ...state,
            isMuted: false,
          };
        }

        Sentry.addBreadcrumb({
          category: 'Player',
          message: 'Mute',
          level: Sentry.Severity.Info,
        });

        state.player.setVolume(0);
        return {
          ...state,
          isMuted: true,
        };
      }
      case 'SetVolume': {
        if (action.volume <= 0) {
          Sentry.addBreadcrumb({
            category: 'Player',
            message: 'SetVolume - Mute',
            level: Sentry.Severity.Info,
          });

          state.player.setVolume(0);

          return {
            ...state,
            isMuted: true,
          };
        }

        Sentry.addBreadcrumb({
          category: 'Player',
          message: 'SetVolume',
          level: Sentry.Severity.Info,
        });

        state.player.setVolume(action.volume);
        return {
          ...state,
          isMuted: false,
          volume: action.volume,
        };
      }
      default:
        throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
    }
  } catch (ex) {
    Sentry.captureException(ex);
    return state;
  }
}

const PlayerStateContext = React.createContext<IPlayerState | undefined>(undefined);
const PlayerDispatchContext = React.createContext<React.Dispatch<PlayerAction> | undefined>(undefined);

interface IPlayerContextProviderProps {
  children: React.ReactNode;
}

export const PlayerProvider = ({ children }: IPlayerContextProviderProps): React.ReactElement<IPlayerContextProviderProps> => {
  const [state, dispatch] = React.useReducer(playerReducer, {
    priorityTracks: [],
    nextTracks: [],
    historyTracks: [],
    currentTime: 0,
    duration: 0,
    isPaused: true,
    repeatMode: RepeatMode.noRepeat,
    isMuted: false,
    volume: 60,
    player: new Player<PlaybackTrack>({
      volume: 60,
      onStateChanged(playerState): void {
        dispatch({
          type: 'UpdatePlayerState',
          state: playerState,
        });
      },
      onTrackStart(track: PlaybackTrack): void {
        dispatch({
          type: 'TrackStart',
          track,
        });
      },
      onTrackEnd(track: PlaybackTrack): void {
        dispatch({
          type: 'TrackEnd',
          track,
        });
      },
      onError(error): void {
        Sentry.captureException(error);
      },
    }),
  });

  return (
    <PlayerStateContext.Provider value={state}>
      <PlayerDispatchContext.Provider value={dispatch}>{children}</PlayerDispatchContext.Provider>
    </PlayerStateContext.Provider>
  );
};

export function usePlayerState(): IPlayerState {
  const context = React.useContext<IPlayerState | undefined>(PlayerStateContext);

  if (typeof context === 'undefined') {
    throw new Error('usePlayerState must be used within a PlayerStateContext');
  }

  return context;
}

export function usePlayerDispatch(): React.Dispatch<PlayerAction> {
  const context = React.useContext<React.Dispatch<PlayerAction> | undefined>(PlayerDispatchContext);

  if (typeof context === 'undefined') {
    throw new Error('usePlayerDispatch must be used within a PlayerDispatchContext');
  }

  return context;
}
