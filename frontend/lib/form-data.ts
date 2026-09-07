/**
 * The `FormData` reading shared by the `"use server"` actions. Nothing here
 * parses beyond the entry's own type: a field carrying the wrong kind of
 * entry reads as absent rather than throwing.
 */

/**
 * An unselected `<input type="file">` still posts a `File` — named `""` and
 * empty — so size is what separates a real upload from an untouched control.
 */
function isFilledFile(entry: FormDataEntryValue): entry is File {
  return entry instanceof File && entry.size > 0;
}

/**
 * Reads one text field, trimmed. A missing field, or one carrying a `File`
 * rather than text, reads as the empty string.
 */
export function readField(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

/** Reads one uploaded file. `null` when the control was left untouched. */
export function readFile(formData: FormData, name: string): File | null {
  const entry = formData.get(name);

  return entry !== null && isFilledFile(entry) ? entry : null;
}

/** Reads a repeated file field, dropping the rows left untouched. */
export function readFiles(formData: FormData, name: string): File[] {
  return formData.getAll(name).filter(isFilledFile);
}

/**
 * Reads a repeated text field verbatim — untrimmed, blanks kept. Callers own
 * whatever normalization their field needs.
 */
export function readStrings(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((entry): entry is string => typeof entry === "string");
}
