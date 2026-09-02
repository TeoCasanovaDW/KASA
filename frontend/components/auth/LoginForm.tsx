"use client";

import { useActionState } from "react";
import AuthField from "@/components/auth/AuthField";
import AuthSubmitButton from "@/components/auth/AuthSubmitButton";
import type { AuthFormState } from "@/lib/auth-actions";

export default function LoginForm({
  action,
}: {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
