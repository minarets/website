import type { BasicCompilation } from './BasicCompilation';
import type { BasicUser } from './BasicUser';
import type { Track } from './Track';

export interface Compilation extends BasicCompilation {
  description: string;
  revisionCount: number;
  createdOn: string;
  createdBy: BasicUser;
  modifiedOn: string;
  modifiedBy: BasicUser;
  trackCount: number;
  tracks: Track[];
}
