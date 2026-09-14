"use server";

import { revalidatePath, updateTag } from "next/cache";
import { isUnavailable } from "./api-client";
import { readFile } from "./form-data";
import { PROPERTIES_TAG } from "./properties";
import { getSessionUser } from "./session";
import { validateAvatarFile } from "./user-form";
import { updateUserPicture, uploadUserPicture } from "./users-api";

/**
 * No `values`, unlike `AuthFormState`: the only field is a file input, which
 * cannot be refilled from the server anyway.
 */
export type AvatarFormState = {
  formError?: string;
  success?: boolean;
};

const NOT_SIGNED_IN = "Vous devez être connecté pour changer votre photo.";
const NO_FILE = "Sélectionnez une image.";
const UPLOAD_FAILED = "L'envoi de l'image a échoué. Réessayez.";
const SAVE_FAILED = "L'enregistrement a échoué. Réessayez plus tard.";
const UNAVAILABLE = "Le service est indisponible. Réessayez plus tard.";
const AVATAR_FIELD = "picture";

/**
 * Server Action bound to the profile avatar form. Uploads the selected file,
 * then patches the session user's `picture`. The id comes from the session,
 * never from the form: `PATCH /api/users/:id` is gated `requireSelfOrAdmin`,
 * and this action never targets anyone else.
 *
 * No redirect: `/profil` re-renders in place and shows the success message.
 */
export async function updateAvatarAction(
  prevState: AvatarFormState,
  formData: FormData
): Promise<AvatarFormState> {
  const user = await getSessionUser();

  if (!user) {
    return { formError: NOT_SIGNED_IN };
  }

  const file = readFile(formData, AVATAR_FIELD);

  if (!file) {
    return { formError: NO_FILE };
  }

  // Re-checked server-side even though the form blocks the same file: the
  // browser check is a convenience, this one is the rule.
  const fileError = validateAvatarFile(file);

  if (fileError) {
    return { formError: fileError };
  }

  let picture: string;

  try {
    picture = await uploadUserPicture(file);
  } catch (error) {
    return { formError: isUnavailable(error) ? UNAVAILABLE : UPLOAD_FAILED };
  }

  try {
    await updateUserPicture(user.id, picture);
  } catch (error) {
    return { formError: isUnavailable(error) ? UNAVAILABLE : SAVE_FAILED };
  }

  // The header avatar is rendered by the root layout, so the whole layout
  // cache has to expire, not just `/profil`.
  revalidatePath("/", "layout");

  // Host avatars ride along with the cached property list: `updateTag` expires
  // it now instead of serving the old picture for up to 60 seconds.
  updateTag(PROPERTIES_TAG);

  return { success: true };
}
