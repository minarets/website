import * as React from 'react';

import type { PlayQueueItem } from '../api/types';

export interface IPlayer {
  currentTrack?: PlayQueueItem;
  queueItems: PlayQueueItem[];
  historyItems: PlayQueueItem[];
}

export const PlayerContext = React.createContext<IPlayer>({ queueItems: [], historyItems: [] });

interface IPlayerContextProviderProps {
  children: React.ReactNode;
}

export const PlayerContextProvider = ({ children }: IPlayerContextProviderProps): React.ReactElement<IPlayerContextProviderProps> => {
  const [player] = React.useState<IPlayer>({ queueItems: [], historyItems: [] });

  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
};
