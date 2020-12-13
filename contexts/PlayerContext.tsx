import type { Track } from 'gapless.js';
import { Queue as GaplessPlayer } from 'gapless.js';
import * as React from 'react';

import type { PlayQueueItem } from '../api/types';

type PlayerTrack = Track<PlayQueueItem>;

export interface IPlayerState {
  player: GaplessPlayer<PlayQueueItem>;
  currentTrack?: PlayQueueItem;
  currentTime: number;
  duration: number;
  isPaused: boolean;
  isMuted: boolean;
  volume: number;
  queueItems: PlayQueueItem[];
  historyItems: PlayQueueItem[];
}

interface IBasicPlayerAction {
  type:
    | 'TogglePlayPause'
    | 'TrackEnd'
    | 'TrackStart'
    | 'TrackProgress'
    | 'ClearQueue'
    | 'PreviousTrack'
    | 'NextTrack'
    | 'Mute'
    | 'Unmute'
    | 'EnableShuffle'
    | 'DisableShuffle'
    | 'EnableRepeat'
    | 'EnableRepeatOne'
    | 'DisableRepeat';
}

interface ISetVolumeAction {
  type: 'SetVolume';
  volume: number;
}

interface IQueueTrackAction {
  type: 'QueueTrack';
  track: PlayQueueItem;
}

type PlayerAction = IBasicPlayerAction | ISetVolumeAction | IQueueTrackAction;

function playerReducer(state: IPlayerState, action: PlayerAction): IPlayerState {
  switch (action.type) {
    case 'TrackEnd':
      return state;
    case 'TrackStart': {
      let historyItems = state.historyItems;
      const lastPlayedTrack = state.currentTrack;
      if (lastPlayedTrack) {
        historyItems = [...state.historyItems, lastPlayedTrack];
      }

      const tracks = (state.player.tracks as PlayerTrack[]).splice(state.player.state.currentTrackIndex);
      return {
        ...state,
        queueItems: tracks.map((track) => track.metadata),
        historyItems,
        currentTrack: state.player.currentTrack?.metadata,
      };
    }
    case 'TrackProgress': {
      if (state.player.currentTrack) {
        return {
          ...state,
          currentTrack: state.player.currentTrack.metadata,
          currentTime: state.player.currentTrack.currentTime,
          duration: state.player.currentTrack.duration,
          isPaused: state.player.currentTrack.isPaused,
        };
      }

      return {
        ...state,
        currentTrack: undefined,
        currentTime: 0,
        duration: 0,
        isPaused: true,
      };
    }
    case 'NextTrack':
    case 'PreviousTrack':
      // TODO: ...
      return state;
    case 'QueueTrack': {
      const updatedState = { ...state };
      if (action.track.url) {
        updatedState.queueItems.push(action.track);
        state.player.addTrack({
          trackUrl: action.track.url,
          metadata: action.track,
        });
      }

      return updatedState;
    }
    case 'ClearQueue': {
      // Retain play history with player queue, but remove all non-played songs
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,no-param-reassign
      state.player.tracks.length = Math.min(state.player.state.currentTrackIndex + 1, state.player.tracks.length);

      return {
        ...state,
        queueItems: [],
      };
    }
    case 'TogglePlayPause': {
      let isPaused = true;
      if (state.player.currentTrack) {
        isPaused = state.player.currentTrack.isPaused;
      }

      return {
        ...state,
        isPaused,
      };
    }
    // case 'EnableShuffle': {
    //   const shuffledQueue = state.queueItems.slice();
    //   let currentIndex = shuffledQueue.length;
    //
    //   // From: https://stackoverflow.com/a/2450976/3085
    //   while (currentIndex !== 0) {
    //     const randomIndex = Math.floor(Math.random() * currentIndex);
    //     currentIndex -= 1;
    //
    //     const tempValue = shuffledQueue[currentIndex];
    //     shuffledQueue[currentIndex] = shuffledQueue[randomIndex];
    //     shuffledQueue[randomIndex] = tempValue;
    //   }
    //
    //   return {
    //     ...state,
    //     shuffledQueue,
    //   };
    // }
    case 'EnableShuffle':
    case 'DisableShuffle':
    case 'EnableRepeat':
    case 'EnableRepeatOne':
    case 'DisableRepeat':
      // TODO: ...
      return state;
    case 'Mute':
    case 'Unmute': {
      return {
        ...state,
        isMuted: !state.isMuted,
      };
    }
    case 'SetVolume': {
      if (action.volume <= 0) {
        return {
          ...state,
          isMuted: true,
        };
      }

      state.player.setVolume(action.volume / 100);
      return {
        ...state,
        isMuted: false,
        volume: action.volume,
      };
    }
    default:
      throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
  }
}

export async function togglePlayPause(state: IPlayerState, dispatch: React.Dispatch<PlayerAction>): Promise<void> {
  try {
    await state.player.togglePlayPause();
  } finally {
    dispatch({
      type: 'TogglePlayPause',
    });
  }
}

const PlayerStateContext = React.createContext<IPlayerState | undefined>(undefined);
const PlayerDispatchContext = React.createContext<React.Dispatch<PlayerAction> | undefined>(undefined);

interface IPlayerContextProviderProps {
  children: React.ReactNode;
}

export const PlayerProvider = ({ children }: IPlayerContextProviderProps): React.ReactElement<IPlayerContextProviderProps> => {
  const [state, dispatch] = React.useReducer(playerReducer, {
    queueItems: [],
    historyItems: [],
    currentTime: 0,
    duration: 0,
    isPaused: true,
    isMuted: false,
    volume: 60,
    player: new GaplessPlayer<PlayQueueItem>({
      onProgress: (): void => {
        dispatch({
          type: 'TrackProgress',
        });
      },
      onStartNewTrack: (): void => {
        dispatch({
          type: 'TrackStart',
        });
      },
      onEnded: (): void => {
        dispatch({
          type: 'TrackEnd',
        });
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
