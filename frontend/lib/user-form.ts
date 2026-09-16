// Pure avatar validation. No DOM, no network, no server import: shared by the
// "use server" action (lib/user-actions.ts) and the client form, exactly as
// `property-form.ts` is.
import { validateImageFile } from "./property-form";

// Below the 10 Mo property uploads allow: an avatar travels through a Server
// Action, whose request body the Vercel deployment caps at 4.5 MB.
// `MAX_IMAGE_BYTES` and the property flow are unchanged.
export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

type FileLike = { type: string; size: number };

/**
 * The MIME rule is `validateImageFile`'s; only the size cap is ours, so the
 * two limits never drift apart on the format message.
 */
export function validateAvatarFile(file: FileLike): string | null {
  // Size zeroed on purpose: only the MIME check is delegated, so a file over
  // 10 Mo reports the 4 Mo cap below rather than the property limit.
  const typeError = validateImageFile({ type: file.type, size: 0 });

  if (typeError) {
    return typeError;
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return "L'image dépasse 4 Mo.";
  }

  return null;
}
