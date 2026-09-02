/**
 * Server-only module: reads and writes the httpOnly session cookie. Never
 * import it from a Client Component — only the `SessionUser` type may cross
 * that boundary.
 *
 * The JWT is decoded, not signature-verified. Verifying would mean adding a
 * crypto dependency and sharing the backend's secret with the frontend; the
 * decoded payload is used only for UI display and for deriving `host_id`,
 * while every privileged call still sends the token to the backend, which
 * does verify the signature. `exp` is enforced on read, so an expired token
 * reads as logged out.
 */

import { cookies } from "next/headers";
import type { SessionUser, UserRole } from "@/types/user";

const SESSION_COOKIE = "kasa_session";
const FALLBACK_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

type SessionTokenPayload = {
  id: number;
  role: UserRole;
  name: string;
  email: string | null;
  exp: number | null;
};

function isUserRole(value: unknown): value is UserRole {
  return value === "client" || value === "owner" || value === "admin";
}

/**
 * The only place in the codebase that splits a JWT. Reports structure only:
 * expiry is not enforced here, because `createSession` needs the `exp` of a
 * token it is about to store. Never throws — anything malformed is `null`.
 */
function parseTokenPayload(token: string): SessionTokenPayload | null {
  const segments = token.split(".");

  if (segments.length !== 3) {
    return null;
  }

  try {
    const json = Buffer.from(
      segments[1].replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    const payload: unknown = JSON.parse(json);

    if (typeof payload !== "object" || payload === null) {
      return null;
    }

    const { id, role, name, email, exp } = payload as Record<string, unknown>;

    if (typeof id !== "number" || !isUserRole(role)) {
      return null;
    }

    return {
      id,
      role,
      name: typeof name === "string" ? name : "",
      email: typeof email === "string" ? email : null,
      exp: typeof exp === "number" ? exp : null,
    };
  } catch {
    return null;
  }
}

/**
 * Pure: no cookie access, so the unit tests can drive it directly. Returns
 * `null` for a malformed token or one whose `exp` has passed. A payload with
 * no `exp` at all is treated as non-expiring.
 */
export function decodeSessionToken(token: string): SessionUser | null {
  const payload = parseTokenPayload(token);

  if (!payload) {
    return null;
  }

  if (payload.exp !== null && payload.exp * 1000 <= Date.now()) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}

/**
 * Stores the raw JWT and nothing else. The cookie outlives the token by no
 * more than the fallback window: `maxAge` tracks the token's own `exp` when
 * the payload parsed.
 */
export async function createSession(token: string): Promise<void> {
  const payload = parseTokenPayload(token);
  const remainingSeconds =
    payload?.exp !== null && payload?.exp !== undefined
      ? payload.exp - Math.floor(Date.now() / 1000)
      : 0;

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // A `secure` cookie is never stored over http://localhost, so dev logins
    // would silently fail.
    secure: process.env.NODE_ENV === "production",
    maxAge: remainingSeconds > 0 ? remainingSeconds : FALLBACK_MAX_AGE_SECONDS,
  });
}

/** The raw token, for the `Authorization: Bearer` header of privileged calls. */
export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();

  return token ? decodeSessionToken(token) : null;
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
