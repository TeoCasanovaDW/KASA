"use server";

import { revalidatePath } from "next/cache";
import { markThreadRead, sendMessage } from "./messages-api";
import { getSessionUser } from "./session";

/** `value` echoes the typed text back so a failed send keeps what was written. */
export type MessageFormState = {
  error?: string;
  value?: string;
};

const SEND_FAILED = "L'envoi a échoué. Réessayez.";

/**
 * Marks the thread's incoming messages read, then refreshes the list so its
 * unread dot clears.
 *
 * Failures are swallowed on purpose: an unread dot that lingers is a far
 * smaller problem than a thread that refuses to render because marking it read
 * threw.
 */
export async function markThreadReadAction(contactId: number): Promise<void> {
  try {
    await markThreadRead(contactId);
    revalidatePath("/messagerie");
  } catch {
    // Deliberately ignored — see above.
  }
}

export async function sendMessageAction(
  prevState: MessageFormState,
  formData: FormData
): Promise<MessageFormState> {
  const raw = formData.get("body");
  const body = typeof raw === "string" ? raw.trim() : "";
  const recipientId = Number(formData.get("recipientId"));
  const propertyId = formData.get("propertyId");

  // The sender is the session, never the form: a posted sender id is ignored
  // here and by the backend, which reads it from the JWT.
  const user = await getSessionUser();

  // Unreachable from the UI — the button is disabled for both — so it needs no
  // copy of its own beyond the generic failure.
  if (!user || !body || !Number.isInteger(recipientId) || recipientId <= 0) {
    return { error: SEND_FAILED, value: body };
  }

  try {
    await sendMessage({
      recipientId,
      body,
      propertyId: typeof propertyId === "string" && propertyId ? propertyId : undefined,
    });
  } catch {
    // Every failure reads the same to the user, so the status is not inspected.
    return { error: SEND_FAILED, value: body };
  }

  // Both views refresh: the thread gains the message, the list its new preview.
  revalidatePath(`/messagerie/${recipientId}`);
  revalidatePath("/messagerie");

  // No `value`, which is what clears the field on success.
  return {};
}
