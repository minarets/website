import { Track } from './Track';
import { BasicCompilation } from './BasicCompilation';

export interface Compilation extends BasicCompilation {
  description: string;
  trackCount: number;
  tracks: Track[];
}
