import { ApiError } from "./api-client";
import { getSessionToken } from "./session";

/**
 * Server-only: the shared init for authenticated API calls. Every such call
 * needs the session's JWT and must never be cached, since the response is
 * scoped to whichever user is signed in.
 */
export async function authInit(): Promise<RequestInit> {
  const token = await getSessionToken();

  if (!token) {
    throw new ApiError("authentication required", 401);
  }

  return {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  };
}
