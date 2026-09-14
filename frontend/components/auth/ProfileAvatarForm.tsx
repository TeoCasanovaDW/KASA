"use client";

// The action arrives as a prop rather than an import, exactly like
// `PropertyForm`/`LoginForm`: it keeps this component free of the
// `"use server"` module.
import { useActionState, useState } from "react";
import ImageInput from "@/components/property/ImageInput";
import { validateAvatarFile } from "@/lib/user-form";
import type { AvatarFormState } from "@/lib/user-actions";

export default function ProfileAvatarForm({
  action,
}: {
  action: (
    state: AvatarFormState,
    formData: FormData
  ) => Promise<AvatarFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [sizeError, setSizeError] = useState<string | null>(null);

  /**
   * `ImageInput` owns the format and 10 Mo rules, and clears the field itself
   * when one fails, so `required` below already blocks those. This adds the
   * stricter 4 Mo avatar cap on top, without touching `ImageInput`: the change
   * event bubbles here after the field has handled it.
   */
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    setSizeError(selected ? validateAvatarFile(selected) : null);
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div onChange={handleChange}>
        <ImageInput
          id="picture"
          name="picture"
          label="Nouvelle photo de profil"
          required
        />
      </div>

      {sizeError && (
        <p role="alert" aria-live="polite" className="text-xs text-kasa-red">
          {sizeError}
        </p>
      )}

      {state.formError && (
        <p role="alert" aria-live="polite" className="text-sm text-kasa-red">
          {state.formError}
        </p>
      )}

      {state.success && !sizeError && (
        <p aria-live="polite" className="text-sm text-kasa-gray-dark">
          Votre photo de profil a été mise à jour.
        </p>
      )}

      {/* Copied from PropertyForm's submit rather than AuthSubmitButton, whose
          fixed 230px centred pill does not fit this column. */}
      <button
        type="submit"
        disabled={pending || sizeError !== null}
        className="self-start rounded-lg bg-kasa-red px-6 py-2 text-sm text-kasa-white transition-colors hover:bg-kasa-dark-orange disabled:opacity-70"
      >
        {pending ? "Envoi en cours…" : "Mettre à jour"}
      </button>
    </form>
  );
}
