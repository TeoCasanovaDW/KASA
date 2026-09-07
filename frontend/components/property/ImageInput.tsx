"use client";

// No server-only imports: stays renderable under Vitest, like AuthField.
import { useEffect, useRef, useState } from "react";
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
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- object URL, not a static/remote asset next/image can optimize.
          <img
            src={previewUrl}
            alt=""
            className="h-12 w-12 flex-none rounded-lg object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-12 w-12 flex-none rounded-lg bg-kasa-gray-light"
          />
        )}

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
          className="min-w-0 flex-1 text-sm text-kasa-gray-dark file:mr-3 file:rounded-lg file:border-0 file:bg-kasa-gray-light file:px-3 file:py-2 file:text-sm file:font-semibold file:text-kasa-black"
        />

        {file && (
          <button
            type="button"
            onClick={handleRemove}
            className="flex-none text-xs font-semibold text-kasa-red"
          >
            Retirer
          </button>
        )}
      </div>

      {file && (
        <p className="mt-1 text-xs text-kasa-gray-dark">{file.name}</p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-kasa-red">
          {error}
        </p>
      )}
    </div>
  );
}
