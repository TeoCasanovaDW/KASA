"use client";

import { useActionState } from "react";
import AuthField from "@/components/auth/AuthField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import type { AuthFormState } from "@/lib/auth-actions";

export default function LoginForm({
  action,
  next,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  /** Where to land once signed in. Already validated by the page. */
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* The action re-validates it: a hidden input is a posted value like
          any other. `state.next` keeps it across a failed submit. */}
      <input type="hidden" name="next" value={state.next ?? next ?? ""} />
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
        autoComplete="current-password"
        error={state.fieldErrors?.password}
      />

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
        label="Se connecter"
        pendingLabel="Connexion…"
        pending={pending}
      />
    </form>
  );
}
