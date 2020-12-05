import { useContext } from 'react';

import type { IPlayer } from '../contexts/PlayerContext';
import { PlayerContext } from '../contexts/PlayerContext';

export function usePlayer(): IPlayer {
  return useContext<IPlayer>(PlayerContext);
}
