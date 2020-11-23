import { useContext } from 'react';

import type { IQueue } from '../contexts/QueueContext';
import { QueueContext } from '../contexts/QueueContext';

export function useQueue(): IQueue {
  return useContext<IQueue>(QueueContext);
}
