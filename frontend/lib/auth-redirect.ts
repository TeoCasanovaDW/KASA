/**
 * Return-URL handling for the auth pages. Protected pages send the visitor to
 * `/connexion?next=<where they were going>`; the auth forms carry that value
 * through as a hidden field and the actions land on it instead of `/`.
 */

/** Where an authenticated user lands when there is no usable return URL. */
export const DEFAULT_REDIRECT = "/";

/**
 * The only destinations a return URL can ever name. `next` is not a URL the
 * site validates, it is a choice among these four literals — so no attacker
 * input ever reaches `redirect()`, and the open-redirect question does not
 * arise at all. A page missing from this list simply sends the visitor home,
 * which is the behaviour there was before any of this existed.
 */
export const RETURN_TO = [
  "/ajouter-un-logement",
  "/mes-annonces",
  "/messagerie",
  "/profil",
] as const;

export type ReturnTo = (typeof RETURN_TO)[number];

/** Exact string equality against the list. Nothing is parsed or rewritten. */
export function safeNext(
  raw: string | string[] | undefined
): ReturnTo | typeof DEFAULT_REDIRECT {
  return typeof raw === "string" &&
    (RETURN_TO as readonly string[]).includes(raw)
    ? (raw as ReturnTo)
    : DEFAULT_REDIRECT;
}

/**
 * Builds the `/connexion` (or `/inscription`) URL that returns to `next`.
 * `next` is typed to the list, so a typo at a call site fails to compile
 * instead of quietly sending the visitor home. The home page needs no
 * parameter, which keeps the plain "Se connecter" header link clean.
 */
export function authUrl(
  base: string,
  next: ReturnTo | typeof DEFAULT_REDIRECT
): string {
  return next === DEFAULT_REDIRECT
    ? base
    : `${base}?next=${encodeURIComponent(next)}`;
}
