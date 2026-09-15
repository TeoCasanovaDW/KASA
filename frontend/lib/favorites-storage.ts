import type { Property } from "@/types/property";

/**
 * The guest-only favorites path, by design and not by omission: a signed-in
 * visitor's favorites live in the backend (`lib/favorites-api.ts`), and no
 * signed-in code path reads or writes this module.
 */

const FAVORITES_STORAGE_KEY = "kasa:favorites";

/**
 * Reads the favorited property ids from localStorage. Never throws: a
 * missing key, malformed JSON, JSON that isn't an array, or an
 * unavailable/throwing storage (SSR, private mode) all resolve to `[]`.
 */
export function readFavoriteIds(): Property["id"][] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed: unknown = JSON.parse(raw ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id): id is Property["id"] => typeof id === "string");
  } catch {
    return [];
  }
}

/**
 * Writes the favorited property ids to localStorage. Never throws: an
 * unavailable/throwing storage (SSR, private mode, quota) is a silent no-op.
 */
export function writeFavoriteIds(ids: Property["id"][]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage unavailable or full — favorites still work in-memory.
  }
}
