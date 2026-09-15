import { cache } from "react";
import { apiFetch } from "./api-client";
import { authInit } from "./api-auth";
import type { Property } from "@/types/property";
import type { SessionUser } from "@/types/user";

// Server-only authenticated favorites: the sibling of `lib/properties-api.ts`.
// The guest path never comes here — it stays in `lib/favorites-storage.ts`.

/** Wraps POST /api/properties/:id/favorite. Idempotent (INSERT OR IGNORE). */
export async function addFavorite(propertyId: Property["id"]): Promise<void> {
  const init = await authInit();

  await apiFetch(
    `/api/properties/${encodeURIComponent(propertyId)}/favorite`,
    { ...init, method: "POST" }
  );
}

/** Wraps DELETE /api/properties/:id/favorite. Removing a missing row is a no-op. */
export async function removeFavorite(
  propertyId: Property["id"]
): Promise<void> {
  const init = await authInit();

  await apiFetch(
    `/api/properties/${encodeURIComponent(propertyId)}/favorite`,
    { ...init, method: "DELETE" }
  );
}

/**
 * Wraps GET /api/users/:id/favorites, which returns full property objects
 * ordered by `created_at DESC`.
 *
 * Wrapped in React `cache()` so the `(site)` layout and `/favoris` share one
 * request per render: `authInit()` sets `cache: "no-store"`, so the Next data
 * cache cannot dedupe the two calls on its own.
 */
export const getFavorites = cache(
  async (userId: SessionUser["id"]): Promise<Property[]> => {
    const init = await authInit();

    return apiFetch<Property[]>(
      `/api/users/${encodeURIComponent(userId)}/favorites`,
      init
    );
  }
);
