"use client";

// The action arrives as a prop rather than an import, exactly like
// `LoginForm`/`MessageComposer`: it keeps this component free of the
// `"use server"` module so the test can inject a stub.
import { useActionState, useState } from "react";
import ImageInput from "@/components/property/ImageInput";
import PicturesField from "@/components/property/PicturesField";
import TagSelector from "@/components/property/TagSelector";
import Avatar from "@/components/ui/Avatar";
import { EQUIPMENTS } from "@/lib/property-form";
import type { PropertyFormState } from "@/types/property-form";

const HOST_PICTURE_SIZE = 64;

// Same label/input/error markup as `AuthField`. Native constraints the auth
// fields never needed (pattern, inputMode, number min/step, placeholder) pass
// straight through via the rest spread instead of being named one by one, so
// this stays a single reused shape rather than one field component per input.
function TextField({
  id,
  name,
  label,
  defaultValue,
  error,
  required,
  ...inputProps
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id" | "name" | "defaultValue" | "required"
>) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-kasa-black">
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-1.5 h-10 w-full rounded-lg border border-kasa-gray-light px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-kasa-red">
          {error}
        </p>
      )}
    </div>
  );
}

function DescriptionField({
  defaultValue,
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  const errorId = "description-error";

  return (
    <div>
      <label htmlFor="description" className="block text-sm font-semibold text-kasa-black">
        Description
      </label>
      <textarea
        id="description"
        name="description"
        rows={5}
        placeholder="Décrivez votre propriété en détail..."
        defaultValue={defaultValue}
        required
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-1.5 w-full resize-none rounded-lg border border-kasa-gray-light p-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-kasa-red">
          {error}
        </p>
      )}
    </div>
  );
}

function EquipmentsField() {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-kasa-black">Équipements</legend>
      <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {EQUIPMENTS.map((equipment) => (
          <label key={equipment} className="flex items-center gap-2">
            <input
              type="checkbox"
              name="equipments"
              value={equipment}
              className="h-4 w-4 accent-kasa-red"
            />
            {equipment}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function HostCard({
  hostName,
  hostPicture,
}: {
  hostName: string;
  hostPicture: string | null;
}) {
  return (
    <div className="rounded-2xl bg-kasa-white p-6 shadow-sm md:p-10">
      <div>
        <p className="text-sm font-semibold text-kasa-black">Nom de l&apos;hôte</p>
        <p className="mt-1 text-sm text-kasa-gray-dark">{hostName}</p>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-kasa-black">Photo de profil</p>
        <div className="mt-1.5">
          <Avatar src={hostPicture} size={HOST_PICTURE_SIZE} rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function PropertyForm({
  action,
  hostName,
  hostPicture,
}: {
  action: (
    state: PropertyFormState,
    formData: FormData
  ) => Promise<PropertyFormState>;
  hostName: string;
  hostPicture: string | null;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [coverInvalid, setCoverInvalid] = useState(false);
  const [picturesInvalid, setPicturesInvalid] = useState(false);

  const fieldErrors = state.fieldErrors ?? {};
  const values = state.values ?? {};
  // Blocks the request on the client for a case the action would otherwise
  // have to reject: a selected file that fails `validateImageFile`.
  const disabled = pending || coverInvalid || picturesInvalid;

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-kasa-black">Ajouter une propriété</h1>
        <button
          type="submit"
          disabled={disabled}
          className="flex-none rounded-lg bg-kasa-red px-6 py-2 text-sm text-kasa-white transition-colors hover:bg-kasa-dark-orange disabled:opacity-70"
        >
          {pending ? "Ajout en cours…" : "Ajouter"}
        </button>
      </div>

      {state.formError && (
        <p role="alert" aria-live="polite" className="text-sm text-kasa-red">
          {state.formError}
        </p>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 rounded-2xl bg-kasa-white p-6 shadow-sm md:p-10">
            <TextField
              id="title"
              name="title"
              label="Titre de la propriété"
              placeholder="Ex : Appartement cosy au coeur de paris"
              defaultValue={values.title}
              error={fieldErrors.title}
              required
            />
            <DescriptionField defaultValue={values.description} error={fieldErrors.description} />
            <TextField
              id="postalCode"
              name="postalCode"
              label="Code postal"
              pattern="\d{5}"
              inputMode="numeric"
              defaultValue={values.postalCode}
              error={fieldErrors.postalCode}
              required
            />
            <TextField
              id="location"
              name="location"
              label="Localisation"
              defaultValue={values.location}
              error={fieldErrors.location}
              required
            />
            <TextField
              id="price"
              name="price"
              label="Prix par nuit (€)"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={values.price}
              error={fieldErrors.price}
              required
            />
          </div>

          <div className="rounded-2xl bg-kasa-white p-6 shadow-sm md:p-10">
            <EquipmentsField />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 rounded-2xl bg-kasa-white p-6 shadow-sm md:p-10">
            <div>
              <ImageInput
                id="cover"
                name="cover"
                label="Image de couverture"
                required
                onValidityChange={setCoverInvalid}
              />
              {fieldErrors.cover && (
                <p className="mt-1 text-xs text-kasa-red">{fieldErrors.cover}</p>
              )}
            </div>

            <div>
              <PicturesField onValidityChange={setPicturesInvalid} />
              {fieldErrors.pictures && (
                <p className="mt-1 text-xs text-kasa-red">{fieldErrors.pictures}</p>
              )}
            </div>
          </div>

          <HostCard hostName={hostName} hostPicture={hostPicture} />

          <div className="rounded-2xl bg-kasa-white p-6 shadow-sm md:p-10">
            <TagSelector />
          </div>
        </div>
      </div>
    </form>
  );
}
