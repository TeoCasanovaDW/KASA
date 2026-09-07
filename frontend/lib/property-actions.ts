"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, isUnavailable } from "./api-client";
import { readField, readFile, readFiles, readStrings } from "./form-data";
import { PROPERTIES_TAG } from "./properties";
import { createProperty, uploadImage } from "./properties-api";
import {
  composeLocation,
  filterEquipments,
  normalizeTag,
  parsePrice,
  validateImageFile,
  validatePropertyForm,
} from "./property-form";
import { getSessionUser } from "./session";
import type { PropertyFormState, PropertyFormValues } from "@/types/property-form";

const OWNER_ONLY = "Seuls les comptes propriétaires peuvent ajouter un logement.";
const UPLOAD_FAILED = "L'envoi des images a échoué. Réessayez.";
const CREATE_FAILED = "La création a échoué. Réessayez plus tard.";
const UNAVAILABLE = "Le service est indisponible. Réessayez plus tard.";

/**
 * Equipments are a closed list the form fully controls, so anything outside
 * `EQUIPMENTS` is dropped silently rather than persisted.
 */
function readEquipments(formData: FormData): string[] {
  return filterEquipments(readStrings(formData, "equipments"));
}

/**
 * Tags stay free-form — custom categories are a required feature (D3) — so
 * they are only trimmed and de-duplicated, case-insensitively like the
 * selector's own duplicate check.
 */
function readTags(formData: FormData): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const entry of readStrings(formData, "tags")) {
    const tag = normalizeTag(entry);
    const key = tag.toLowerCase();

    if (!tag || seen.has(key)) {
      continue;
    }

    seen.add(key);
    tags.push(tag);
  }

  return tags;
}

export async function createPropertyAction(
  prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const values: PropertyFormValues = {
    title: readField(formData, "title"),
    description: readField(formData, "description"),
    postalCode: readField(formData, "postalCode"),
    location: readField(formData, "location"),
    price: readField(formData, "price"),
  };

  // The ownership check the backend does not perform (D5): it trusts whatever
  // `host_id` it is sent. `host_id` therefore only ever comes from the session.
  const user = await getSessionUser();

  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return { formError: OWNER_ONLY, values };
  }

  const coverFile = readFile(formData, "cover");
  const pictures = readFiles(formData, "pictures");

  // Collected in one pass, so a form with several problems shows them all
  // rather than one per round-trip. `pictureCount` re-checks the MAX_PICTURES
  // cap server-side even though the UI already prevents exceeding it.
  const fieldErrors = validatePropertyForm(values, {
    hasCover: coverFile !== null,
    pictureCount: pictures.length,
  });

  if (coverFile) {
    const coverError = validateImageFile(coverFile);

    if (coverError) {
      fieldErrors.cover = coverError;
    }
  }

  for (const picture of pictures) {
    const pictureError = validateImageFile(picture);

    if (pictureError) {
      fieldErrors.pictures = pictureError;
      break;
    }
  }

  const pricePerNight = parsePrice(values.price);

  // The cover and price re-checks are redundant with `validatePropertyForm`
  // above: they are what narrows the two types the request needs, and they
  // guarantee no `0` price ever reaches the API, where a missing or invalid
  // one is silently stored as `80` (D9).
  if (
    Object.keys(fieldErrors).length > 0 ||
    !coverFile ||
    pricePerNight === null
  ) {
    return { fieldErrors, values };
  }

  let coverUrl: string;
  let pictureUrls: string[];

  try {
    coverUrl = await uploadImage(coverFile, "property-cover");
    pictureUrls = [];

    for (const picture of pictures) {
      pictureUrls.push(await uploadImage(picture, "property-picture"));
    }
  } catch {
    return { formError: UPLOAD_FAILED, values };
  }

  let slug: string;

  try {
    const created = await createProperty({
      title: values.title,
      description: values.description,
      location: composeLocation(values.postalCode, values.location),
      price_per_night: pricePerNight,
      cover: coverUrl,
      host_id: user.id,
      pictures: pictureUrls,
      equipments: readEquipments(formData),
      tags: readTags(formData),
    });

    slug = created.slug;
  } catch (error) {
    if (isUnavailable(error)) {
      return { formError: UNAVAILABLE, values };
    }

    const status = error instanceof ApiError ? error.status : null;

    return {
      formError: status === 403 ? OWNER_ONLY : CREATE_FAILED,
      values,
    };
  }

  // Read-your-own-writes: the redirect below lands on `/logements/[slug]`,
  // which resolves the slug through the cached property list. `updateTag`
  // expires that list immediately, so the new property is visible on the very
  // next request instead of after the 60-second window (`revalidateTag` would
  // serve the stale list once more, which is exactly the 404 this fixes).
  updateTag(PROPERTIES_TAG);
  revalidatePath("/");

  // Outside the try/catch: `redirect` signals by throwing, and a catch here
  // would swallow the navigation.
  redirect(`/logements/${slug}`);
}
