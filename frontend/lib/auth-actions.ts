"use server";

import { redirect } from "next/navigation";
import { ApiError } from "./api-client";
import { login, register } from "./auth-api";
import { createSession, destroySession } from "./session";

/** `values` echoes the non-secret inputs back so a failed submit keeps the form filled. */
export type AuthFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

/**
 * Deliberately loose: it rejects the obvious mistakes (`marie`, `marie@`,
 * `marie@localhost`) without pretending to implement RFC 5322. The backend
 * stays the authority on whether an address is usable.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const REQUIRED = "Ce champ est requis.";
const INVALID_EMAIL = "Adresse email invalide.";
const SHORT_PASSWORD = "Le mot de passe doit contenir au moins 6 caractères.";
const UNAVAILABLE = "Le service est indisponible. Réessayez plus tard.";

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

/**
 * Passwords are read verbatim: outer whitespace is part of the credential, so
 * trimming here would make a password unusable at login that registration
 * accepted. Both actions use this, and neither trims.
 */
function readPassword(formData: FormData): string {
  const value = formData.get("password");

  return typeof value === "string" ? value : "";
}

/** A network failure, a 5xx, or a non-`ApiError` throw (e.g. `KASA_API_URL` unset). */
function isUnavailable(error: unknown): boolean {
  return (
    !(error instanceof ApiError) || error.status === 0 || error.status >= 500
  );
}

export async function loginAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = readField(formData, "email");
  const password = readPassword(formData);
  const values = { email };

  const fieldErrors: Record<string, string> = {};

  // Presence wins over format: a blank field never shows the format message.
  if (!email) {
    fieldErrors.email = REQUIRED;
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = INVALID_EMAIL;
  }

  if (!password) {
    fieldErrors.password = REQUIRED;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  try {
    const { token } = await login({ email, password });
    await createSession(token);
  } catch (error) {
    if (isUnavailable(error)) {
      return { formError: UNAVAILABLE, values };
    }

    const status = error instanceof ApiError ? error.status : null;

    return {
      formError:
        status === 401 || status === 400
          ? "Email ou mot de passe incorrect."
          : "La connexion a échoué. Réessayez plus tard.",
      values,
    };
  }

  // Outside the try/catch: `redirect` signals by throwing, and a catch here
  // would swallow the navigation.
  redirect("/");
}

export async function registerAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const nom = readField(formData, "nom");
  const prenom = readField(formData, "prenom");
  const email = readField(formData, "email");
  const password = readPassword(formData);
  const consent = readField(formData, "consent");
  // Never trust the posted value.
  const role = readField(formData, "role") === "owner" ? "owner" : "client";

  const values = { nom, prenom, email, role };

  // Collected in one pass, so a form with three problems shows all three
  // rather than one per round-trip.
  const fieldErrors: Record<string, string> = {};

  if (!nom) {
    fieldErrors.nom = REQUIRED;
  }

  if (!prenom) {
    fieldErrors.prenom = REQUIRED;
  }

  if (!email) {
    fieldErrors.email = REQUIRED;
  } else if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = INVALID_EMAIL;
  }

  if (!password) {
    fieldErrors.password = REQUIRED;
  } else if (password.length < 6) {
    fieldErrors.password = SHORT_PASSWORD;
  }

  if (consent !== "on") {
    fieldErrors.consent = "Vous devez accepter les conditions d'utilisation.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors, values };
  }

  // French display order, inner whitespace collapsed.
  const name = `${prenom} ${nom}`.replace(/\s+/g, " ").trim();

  try {
    const { token } = await register({ name, email, password, role });
    await createSession(token);
  } catch (error) {
    if (isUnavailable(error)) {
      return { formError: UNAVAILABLE, values };
    }

    const status = error instanceof ApiError ? error.status : null;

    if (status === 409) {
      return { fieldErrors: { email: "Cet email est déjà utilisé." }, values };
    }

    if (
      status === 400 &&
      error instanceof ApiError &&
      /password/i.test(error.message)
    ) {
      return { fieldErrors: { password: SHORT_PASSWORD }, values };
    }

    return {
      formError: "L'inscription a échoué. Réessayez plus tard.",
      values,
    };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
