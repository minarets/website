import * as React from 'react';

import type { PlayQueueItem } from '../api/types';

export interface IPlayerState {
  currentTrack?: PlayQueueItem;
  queueItems: PlayQueueItem[];
  historyItems: PlayQueueItem[];
}

interface IQueueTrackAction {
  type: 'QueueTrack';
  track: PlayQueueItem;
}

type PlayerAction = IQueueTrackAction;

function playerReducer(state: IPlayerState, action: PlayerAction): IPlayerState {
  switch (action.type) {
    case 'QueueTrack': {
      const updatedState = { ...state };
      updatedState.queueItems.push(action.track);

      return updatedState;
    }
    default:
      throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
  }
}

const PlayerStateContext = React.createContext<IPlayerState | undefined>(undefined);
const PlayerDispatchContext = React.createContext<React.Dispatch<PlayerAction> | undefined>(undefined);

interface IPlayerContextProviderProps {
  children: React.ReactNode;
}

export const PlayerProvider = ({ children }: IPlayerContextProviderProps): React.ReactElement<IPlayerContextProviderProps> => {
  const [state, dispatch] = React.useReducer(playerReducer, { queueItems: [], historyItems: [] });

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
