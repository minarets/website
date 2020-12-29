// From https://overreacted.io/making-setinterval-declarative-with-react-hooks/

import { useEffect, useRef } from 'react';

export function useInterval(callback: (...args: unknown[]) => void, ms: number): void {
  const savedCallback = useRef<(...args: unknown[]) => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick(): void {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    const id = setInterval(tick, ms);

    // Cleanup
    return (): void => clearInterval(id);
  }, [ms]);
}
