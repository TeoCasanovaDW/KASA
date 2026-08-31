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
