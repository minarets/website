// From https://overreacted.io/making-setinterval-declarative-with-react-hooks/

import { useEffect, useRef } from 'react';

export function useInterval(callback: (...args: unknown[]) => void, ms: number, executeImmediately?: boolean): void {
  const savedCallback = useRef<(...args: unknown[]) => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (executeImmediately && savedCallback.current) {
      savedCallback.current();
    }
  }, [executeImmediately]);

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
