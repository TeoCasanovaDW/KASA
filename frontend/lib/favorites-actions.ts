"use server";

import { revalidatePath } from "next/cache";
import { addFavorite, removeFavorite } from "./favorites-api";
import { getSessionUser } from "./session";
import type { Property } from "@/types/property";

/**
 * Server Action behind the signed-in favorite toggle. It never throws across
 * the boundary: a missing session and a failed call both come back as
 * `{ ok: false }`, which is the caller's signal to revert its optimistic
 * state. `/favoris` is revalidated so the list matches on the next visit.
 */
export async function toggleFavoriteAction(
  propertyId: Property["id"],
  next: boolean
): Promise<{ ok: boolean }> {
  const user = await getSessionUser();

  if (!user) {
    return { ok: false };
  }

  try {
    if (next) {
      await addFavorite(propertyId);
    } else {
      await removeFavorite(propertyId);
    }
  } catch {
    return { ok: false };
  }

  revalidatePath("/favoris");

  return { ok: true };
}
