import type { TrackWithExtendedInformation } from '../minarets/types';

export interface PlayQueueItem extends TrackWithExtendedInformation {
  detailsByToken: Record<string, string>;
  // Unique id for item in queue
  queueId: string;
}
