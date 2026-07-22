// FreshWash — usePolling Hook
// Runs a callback immediately on mount/focus, then on a fixed interval.
// Automatically disables background polling when screen is unfocused.
// Cleans up the interval automatically on unmount.

import { useEffect, useRef } from 'react';
import { useIsFocused } from '@react-navigation/native';

/**
 * Runs `callback` once immediately, then every `intervalMs` milliseconds.
 * Cleans up automatically on component unmount and pauses when screen is unfocused.
 *
 * @param callback  Function to call on each tick. Receives `isSilent` (true on background ticks).
 * @param intervalMs  Polling interval in ms. Defaults to 15,000 (15 seconds).
 * @param enabled  Set to false to pause polling without unmounting. Defaults to true.
 */
export function usePolling(
  callback: (isSilent: boolean) => void,
  intervalMs: number = 15000,
  enabled: boolean = true
): void {
  const savedCallback = useRef(callback);
  const isFocused = useIsFocused();

  // Keep the ref up-to-date
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const isCurrentlyEnabled = enabled && isFocused;
    if (!isCurrentlyEnabled) return;

    // Call immediately (isSilent = false, meaning show initial loader)
    savedCallback.current(false);

    // Call on ticks (isSilent = true, meaning silent / do not show loader)
    const id = setInterval(() => savedCallback.current(true), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled, isFocused]);
}

