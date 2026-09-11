"use client";

// No server-only imports: stays renderable under Vitest, like ImageInput.
import { useRef, useState } from "react";
import MinusIcon from "@/components/icons/MinusIcon";
import ImageInput from "@/components/property/ImageInput";
import { MAX_PICTURES } from "@/lib/property-form";

type Row = { id: string };

/**
 * A repeatable list of `ImageInput` rows, all named "pictures" so the action
 * reads them with `formData.getAll("pictures")`. Reads `MAX_PICTURES`
 * directly rather than taking it as a prop (see T5).
 */
export default function PicturesField({
  onValidityChange,
}: {
  onValidityChange?: (invalid: boolean) => void;
}) {
  const [rows, setRows] = useState<Row[]>(() => [{ id: "0" }]);
  const invalidRows = useRef<Set<string>>(new Set());
  // Never reused as a row id, even after rows are removed, so removing a row
  // never reassigns another row's file input.
  const nextId = useRef(1);

  function reportValidity(id: string, invalid: boolean) {
    if (invalid) {
      invalidRows.current.add(id);
    } else {
      invalidRows.current.delete(id);
    }
    onValidityChange?.(invalidRows.current.size > 0);
  }

  function addRow() {
    setRows((prev) => [...prev, { id: String(nextId.current++) }]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
    reportValidity(id, false);
  }

  return (
    <div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <ImageInput
                id={`pictures-${row.id}`}
                name="pictures"
                label={index === 0 ? "Image du logement" : `Image du logement ${index + 1}`}
                onValidityChange={(invalid) => reportValidity(row.id, invalid)}
              />
            </div>

            {index > 0 && (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                aria-label="Retirer cette image"
                className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-kasa-red text-kasa-white transition-colors hover:bg-kasa-dark-orange"
              >
                <MinusIcon />
              </button>
            )}
          </div>
        ))}
      </div>

      {rows.length < MAX_PICTURES && (
        <button
          type="button"
          onClick={addRow}
          className="mt-3 text-sm font-semibold text-kasa-red"
        >
          +Ajouter une image
        </button>
      )}
    </div>
  );
}
