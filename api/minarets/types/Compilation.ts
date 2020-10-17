import type { BasicCompilation } from './BasicCompilation';
import type { Track } from './Track';

export interface Compilation extends BasicCompilation {
  description: string;
  trackCount: number;
  tracks: Track[];
}
