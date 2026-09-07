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
