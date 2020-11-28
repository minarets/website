import * as React from 'react';

import type { PlayQueueItem } from '../api/types';

export interface IQueue {
  currentTrack: PlayQueueItem | undefined;
  queueItems: PlayQueueItem[];
  historyItems: PlayQueueItem[];
}

export const QueueContext = React.createContext<IQueue>({ currentTrack: undefined, queueItems: [], historyItems: [] });

interface IQueueContextProviderProps {
  children: React.ReactNode;
}

export const QueueContextProvider = ({ children }: IQueueContextProviderProps): React.ReactElement<IQueueContextProviderProps> => {
  const [queue] = React.useState<IQueue>({ currentTrack: undefined, queueItems: [], historyItems: [] });

  return <QueueContext.Provider value={queue}>{children}</QueueContext.Provider>;
};
