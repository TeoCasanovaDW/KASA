import { apiFetch } from "./api-client";
import { authInit } from "./api-auth";
import type { Property, PropertyDetail } from "@/types/property";

// Server-only authenticated writes: the sibling of the public read module
// `lib/properties.ts`, which stays unauthenticated and cached.

export type CreatePropertyInput = {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  cover: string;
  host_id: number;
  pictures: string[];
  equipments: string[];
  tags: string[];
};

/**
 * Wraps POST /api/uploads/image and returns the `/uploads/<filename>` URL.
 * No `property_id`: the property does not exist yet at upload time.
 */
export async function uploadImage(
  file: File,
  purpose: "property-cover" | "property-picture"
): Promise<string> {
  const init = await authInit();
  const body = new FormData();
  body.append("file", file);
  body.append("purpose", purpose);

  // No Content-Type header: `fetch` must set the multipart boundary itself.
  const uploaded = await apiFetch<{ url: string }>("/api/uploads/image", {
    ...init,
    method: "POST",
    body,
  });

  return uploaded.url;
}

/** Wraps POST /api/properties. */
export async function createProperty(
  input: CreatePropertyInput
): Promise<PropertyDetail> {
  const init = await authInit();

  return apiFetch<PropertyDetail>("/api/properties", {
    ...init,
    method: "POST",
    headers: {
      ...init.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

/**
 * Wraps DELETE /api/properties/:id (204, no body). Host only: the backend
 * answers 403 to anyone else and 404 once the property is gone (D16).
 */
export async function deleteProperty(id: Property["id"]): Promise<void> {
  const init = await authInit();

  await apiFetch(`/api/properties/${encodeURIComponent(id)}`, {
    ...init,
    method: "DELETE",
  });
}
