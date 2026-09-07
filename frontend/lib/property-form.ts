// Pure form data and validation for property creation. No DOM, no network:
// imported from both the client form (components/property/*) and the
// "use server" action (lib/property-actions.ts), so it stays framework-free.
import type { PropertyFormValues } from "@/types/property-form";

// The 24 mockup labels, in column order.
export const EQUIPMENTS = [
  "Micro-Ondes",
  "Clic-clac",
  "Douche italienne",
  "Four",
  "Frigo",
  "Rangements",
  "WIFI",
  "Lit",
  "Parking",
  "Bouilloire",
  "Sèche Cheveux",
  "SDB",
  "Machine à laver",
  "Toilettes sèches",
  "Cuisine équipée",
  "Cintres",
  "Télévision",
  "Baie vitrée",
  "Chambre Séparée",
  "Hotte",
  "Climatisation",
  "Baignoire",
  "Frigo Américain",
  "Vue Parc",
] as const;

// Deduplicated union of both mockups (see `## Mockup divergences`).
export const PREDEFINED_TAGS = [
  "Parc",
  "Night Life",
  "Culture",
  "Nature",
  "Touristique",
  "Vue sur mer",
  "Pour les couples",
  "Famille",
  "Forêt",
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

// The cap that bounds the Server Action request size (see
// `## Request size budget`). Both the UI and the action read it from here;
// do not restate the number anywhere else.
export const MAX_PICTURES = 6;

const REQUIRED = "Ce champ est requis.";
const POSTAL_CODE_PATTERN = /^\d{5}$/;

type FileLike = { type: string; size: number };

type ValidatePropertyFormOptions = {
  hasCover: boolean;
  pictureCount: number;
};

/**
 * Applies the `## Validation rules` table and returns all problems in one
 * pass. Presence wins over format, as in `auth-actions.ts`: a blank field
 * never shows the format message.
 */
export function validatePropertyForm(
  values: PropertyFormValues,
  { hasCover, pictureCount }: ValidatePropertyFormOptions
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!values.title.trim()) {
    fieldErrors.title = REQUIRED;
  }

  if (!values.description.trim()) {
    fieldErrors.description = REQUIRED;
  }

  const postalCode = values.postalCode.trim();

  if (!postalCode) {
    fieldErrors.postalCode = REQUIRED;
  } else if (!POSTAL_CODE_PATTERN.test(postalCode)) {
    fieldErrors.postalCode = "Le code postal doit contenir 5 chiffres.";
  }

  if (!values.location.trim()) {
    fieldErrors.location = REQUIRED;
  }

  if (!values.price.trim()) {
    fieldErrors.price = REQUIRED;
  } else if (parsePrice(values.price) === null) {
    fieldErrors.price = "Le prix doit être un nombre supérieur à 0.";
  }

  if (!hasCover) {
    fieldErrors.cover = "Une image de couverture est requise.";
  }

  if (pictureCount > MAX_PICTURES) {
    fieldErrors.pictures = "6 images maximum.";
  }

  return fieldErrors;
}

/** The two per-file rules. Takes a plain object so it runs without a DOM. */
export function validateImageFile(file: FileLike): string | null {
  if (!file.type.startsWith("image/")) {
    return "Format non supporté. Utilisez une image.";
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return "L'image dépasse 10 Mo.";
  }

  return null;
}

/** Keeps only exact members of `EQUIPMENTS`, in `EQUIPMENTS` order, deduplicated. */
export function filterEquipments(values: string[]): string[] {
  const submitted = new Set(values);

  return EQUIPMENTS.filter((equipment) => submitted.has(equipment));
}

/** Trims both and joins with one space (D8). */
export function composeLocation(postalCode: string, location: string): string {
  return `${postalCode.trim()} ${location.trim()}`;
}

/** `null` for anything non-finite or `<= 0`. */
export function parsePrice(raw: string): number | null {
  const price = Number(raw);

  return Number.isFinite(price) && price > 0 ? price : null;
}

/** Trimmed; used for the case-insensitive duplicate check. */
export function normalizeTag(raw: string): string {
  return raw.trim();
}
