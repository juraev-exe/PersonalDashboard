// ============================================
// LifeOS — Media Query Hook
// ============================================

import { useEffect, useState } from 'react';

/** Width below which the app switches to the mobile layout (bottom nav, no sidebar). */
export const MOBILE_BREAKPOINT = 768;

const supportsMatchMedia = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * Subscribes to a CSS media query and re-renders when it starts/stops matching.
 * Falls back to `false` in environments without `matchMedia` (tests, SSR).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    supportsMatchMedia() ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    if (!supportsMatchMedia()) return;

    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Re-sync in case the query changed between render and effect.
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True on phone-sized viewports. */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
