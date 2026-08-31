import { apiFetch, ApiError } from "./api-client";
import type { Property, PropertyDetail } from "@/types/property";

// Public, static seed data: a 60-second revalidation keeps pages
// server-rendered and cheap.
const PROPERTIES_REVALIDATE = 60;

/** Wraps GET /api/properties. */
export async function getProperties(): Promise<Property[]> {
  return apiFetch<Property[]>("/api/properties", {
    next: { revalidate: PROPERTIES_REVALIDATE },
  });
}

/** Wraps GET /api/properties/:id. `null` means the property was not found. */
export async function getPropertyById(
  id: string
): Promise<PropertyDetail | null> {
  try {
    return await apiFetch<PropertyDetail>(
      `/api/properties/${encodeURIComponent(id)}`,
      { next: { revalidate: PROPERTIES_REVALIDATE } }
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Resolves a property by slug. The backend has no slug lookup endpoint and
 * must not be modified, so this lists properties, finds the matching slug,
 * then fetches the detail by id. `null` means the property was not found.
 */
export async function getPropertyBySlug(
  slug: string
): Promise<PropertyDetail | null> {
  const properties = await getProperties();
  const match = properties.find((property) => property.slug === slug);

  if (!match) {
    return null;
  }

  return getPropertyById(match.id);
}
