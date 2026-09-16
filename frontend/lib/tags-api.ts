import { apiFetch } from "./api-client";
import { authInit } from "./api-auth";
import type { SessionUser } from "@/types/user";

// Server-only: GET /api/users/:id/tags is restricted to the user itself or an
// admin, so the call is session-scoped and never cached. This module must
// never run in the browser: the backend registers no CORS middleware.

/** Wraps GET /api/users/:id/tags: the distinct tag names of the user's own properties. */
export async function getUserTags(
  userId: SessionUser["id"]
): Promise<string[]> {
  return apiFetch<string[]>(
    `/api/users/${encodeURIComponent(userId)}/tags`,
    await authInit()
  );
}
