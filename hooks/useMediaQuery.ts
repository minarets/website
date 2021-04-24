import { useEffect } from 'react';
import * as React from 'react';

export function useMediaQuery(query: string): boolean {
  const [hasMatches, setHasMatches] = React.useState(false);

  useEffect(() => {
    const mediaWatcher = window.matchMedia(query);
    setHasMatches(mediaWatcher.matches);

    function handleMediaChange(): void {
      setHasMatches(mediaWatcher.matches);
    }

    mediaWatcher.addEventListener('change', handleMediaChange);

    return (): void => {
      mediaWatcher.removeEventListener('change', handleMediaChange);
    };
  }, [query]);

  return hasMatches;
}
