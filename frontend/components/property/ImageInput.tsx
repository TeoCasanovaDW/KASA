"use client";

// No server-only imports: stays renderable under Vitest, like AuthField.
import { useEffect, useRef, useState } from "react";
import PlusIcon from "@/components/icons/PlusIcon";
import { validateImageFile } from "@/lib/property-form";

/**
 * One labelled `<input type="file">` with a thumbnail preview and a remove
 * button. Used both for the single "Image de couverture" field and, wrapped
 * by `PicturesField`, for each "Image du logement" row.
 */
export default function ImageInput({
  id,
  name,
  label,
  required,
  onValidityChange,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  onValidityChange?: (invalid: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errorId = `${id}-error`;

  // Revoke whatever object URL is current, whether the file is replaced,
  // removed, or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function setPreview(next: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (next) {
      const url = URL.createObjectURL(next);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;

    if (!selected) {
      setFile(null);
      setPreview(null);
      setError(null);
      onValidityChange?.(false);
      return;
    }

    const message = validateImageFile({
      type: selected.type,
      size: selected.size,
    });

    if (message) {
      setError(message);
      setFile(null);
      setPreview(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      onValidityChange?.(true);
      return;
    }

    setError(null);
    setFile(selected);
    setPreview(selected);
    onValidityChange?.(false);
  }

  function handleRemove() {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onValidityChange?.(false);
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-kasa-black">
        {label}
      </label>

      <div className="mt-1.5 flex items-center gap-3">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- object URL, not a static/remote asset next/image can optimize.
          <img
            src={previewUrl}
            alt=""
            className="h-10 w-10 flex-none rounded-lg object-cover"
          />
        )}

        <div className="flex h-10 min-w-0 flex-1 items-center rounded-lg border border-kasa-gray-light px-4 text-sm text-kasa-gray-dark">
          <span className="truncate">
            {file ? file.name : "Aucun fichier choisi"}
          </span>
        </div>

        {/* Visually hidden: the label above already gives it its accessible
            name. The red button below is the visible way to open the file
            picker, matching the mockup's input-plus-button row. */}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept="image/*"
          required={required}
          onChange={handleChange}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          className="sr-only"
        />

        {/* Distinct from `label` on purpose: an identical aria-label would
            give `getByLabelText(label)` a second match (the hidden input
            already owns that name via the heading label above). */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={`Choisir un fichier pour ${label}`}
          className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-kasa-red text-kasa-white transition-colors hover:bg-kasa-dark-orange"
        >
          <PlusIcon />
        </button>
      </div>

      {file && (
        <button
          type="button"
          onClick={handleRemove}
          className="mt-1 text-xs font-semibold text-kasa-red"
        >
          Retirer
        </button>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-kasa-red">
          {error}
        </p>
      )}
    </div>
  );
}
