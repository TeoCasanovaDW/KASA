/**
 * Returns the Kasa API origin, read from `KASA_API_URL` on every call.
 * Throws if the variable is missing or empty. No `NEXT_PUBLIC_` prefix,
 * so this must only run server-side.
 */
export function getApiUrl(): string {
  const raw = process.env.KASA_API_URL;
  const trimmed = raw?.trim();

  if (!trimmed) {
    throw new Error(
      "KASA_API_URL is not set. Define it in frontend/.env.local."
    );
  }

  return trimmed.replace(/\/+$/, "");
}

/**
 * Returns the Kasa site origin, read from `KASA_SITE_URL` on every call.
 * Unlike `getApiUrl()`, this never throws: it runs during `next build`,
 * where the variable is legitimately absent, and falls back to
 * `http://localhost:3000` when missing or empty. No `NEXT_PUBLIC_`
 * prefix, so this must only run server-side.
 */
export function getSiteUrl(): string {
  const raw = process.env.KASA_SITE_URL;
  const trimmed = raw?.trim();

  if (!trimmed) {
    return "http://localhost:3000";
  }

  return trimmed.replace(/\/+$/, "");
}
