const FAVORITES_STORAGE_KEY = "kasa:favorites";

/**
 * Reads the favorited property ids from localStorage. Never throws: a
 * missing key, malformed JSON, JSON that isn't an array, or an
 * unavailable/throwing storage (SSR, private mode) all resolve to `[]`.
 */
export function readFavoriteIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed: unknown = JSON.parse(raw ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

/**
 * Writes the favorited property ids to localStorage. Never throws: an
 * unavailable/throwing storage (SSR, private mode, quota) is a silent no-op.
 */
export function writeFavoriteIds(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable or full — favorites still work in-memory.
  }
}
