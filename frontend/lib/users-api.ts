import { apiFetch } from "./api-client";
import { authInit } from "./api-auth";
import type { UserRole } from "@/types/user";

// Server-only: GET /api/users/:id is restricted to the user itself or an admin,
// so the call is session-scoped and never cached.

export type ApiUser = {
  id: number;
  name: string;
  picture: string | null;
  role: UserRole;
};

/** Wraps GET /api/users/:id. */
export async function getUserById(id: number): Promise<ApiUser> {
  return apiFetch<ApiUser>(`/api/users/${id}`, await authInit());
}

/**
 * Wraps POST /api/uploads/image for the session user's own avatar and returns
 * the `/uploads/<filename>` URL. Deliberately mirrors `uploadImage` in
 * `properties-api.ts` rather than sharing a module: the duplication is ten
 * lines and keeps each module owning its own endpoint surface.
 */
export async function uploadUserPicture(file: File): Promise<string> {
  const init = await authInit();
  const body = new FormData();
  body.append("file", file);
  body.append("purpose", "user-picture");

  // No Content-Type header: `fetch` must set the multipart boundary itself.
  const uploaded = await apiFetch<{ url: string }>("/api/uploads/image", {
    ...init,
    method: "POST",
    body,
  });

  return uploaded.url;
}

/** Wraps PATCH /api/users/:id, which accepts `picture` alone. */
export async function updateUserPicture(
  id: number,
  picture: string
): Promise<ApiUser> {
  const init = await authInit();

  return apiFetch<ApiUser>(`/api/users/${id}`, {
    ...init,
    method: "PATCH",
    headers: {
      ...init.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ picture }),
  });
}
