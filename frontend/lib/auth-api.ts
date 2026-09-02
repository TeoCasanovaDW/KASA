import { apiFetch } from "./api-client";
import type { AuthResponse } from "@/types/user";

// Server-only: these wrappers are consumed by lib/auth-actions.ts ("use server").
// Both calls are uncached mutations; `ApiError` propagates untouched so the
// caller owns the status -> copy mapping.

export async function login(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  });
}

export async function register(payload: {
  name: string;
  email: string;
  password: string;
  role: "client" | "owner";
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}
