"use client";

import { useActionState } from "react";
import AuthField from "@/components/auth/AuthField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import type { AuthFormState } from "@/lib/auth-actions";

export default function RegisterForm({
  action,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  // Re-checked from the returned state after a failed submit; `Client` is the
  // default on first render.
  const role = state.values?.role === "owner" ? "owner" : "client";
  const consentError = state.fieldErrors?.consent;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <AuthField
        id="nom"
        name="nom"
        label="Nom"
        required
        autoComplete="family-name"
        defaultValue={state.values?.nom}
        error={state.fieldErrors?.nom}
      />
      <AuthField
        id="prenom"
        name="prenom"
        label="Prénom"
        required
        autoComplete="given-name"
        defaultValue={state.values?.prenom}
        error={state.fieldErrors?.prenom}
      />
      <AuthField
        id="email"
        name="email"
        label="Adresse email"
        type="email"
        required
        autoComplete="email"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <AuthField
        id="password"
        name="password"
        label="Mot de passe"
        type="password"
        required
        minLength={6}
        autoComplete="new-password"
        error={state.fieldErrors?.password}
      />

      <fieldset>
        <legend className="text-sm font-semibold text-kasa-black">
          Je m&apos;inscris en tant que
        </legend>
        <div className="mt-1.5 flex items-center gap-6 text-sm">
          <label htmlFor="role-client" className="flex items-center gap-2">
            <input
              id="role-client"
              name="role"
              type="radio"
              value="client"
              defaultChecked={role === "client"}
            />
            Client
          </label>
          <label htmlFor="role-owner" className="flex items-center gap-2">
            <input
              id="role-owner"
              name="role"
              type="radio"
              value="owner"
              defaultChecked={role === "owner"}
            />
            Propriétaire
          </label>
        </div>
      </fieldset>

      {/* The mockup sets this row slightly further from the fields than the
          fields sit from each other. */}
      <div className="mt-1.5">
        <div className="flex items-center gap-2 text-sm">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={consentError ? "true" : undefined}
            aria-describedby={consentError ? "consent-error" : undefined}
            className="h-4 w-4 accent-kasa-red"
          />
          <label htmlFor="consent">
            J&apos;accepte les conditions d&apos;utilisation
          </label>
        </div>
        {consentError && (
          <p id="consent-error" className="mt-1 text-xs text-kasa-red">
            {consentError}
          </p>
        )}
      </div>

      {state.formError && (
        <p
          role="alert"
          aria-live="polite"
          className="text-center text-sm text-kasa-red"
        >
          {state.formError}
        </p>
      )}

      <AuthSubmitButton
        label="S'inscrire"
        pendingLabel="Inscription…"
        pending={pending}
      />
    </form>
  );
}
