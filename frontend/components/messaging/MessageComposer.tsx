"use client";

import { useActionState, useState } from "react";
import ArrowUpIcon from "@/components/icons/ArrowUpIcon";
import type { MessageFormState } from "@/lib/messages-actions";

/**
 * The action arrives as a prop rather than an import, exactly like `LoginForm`:
 * it keeps this component free of the `"use server"` module so the tests can
 * inject a stub.
 */
export default function MessageComposer({
  action,
  recipientId,
  propertyId,
}: {
  action: (
    state: MessageFormState,
    formData: FormData
  ) => Promise<MessageFormState>;
  recipientId: number;
  propertyId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [value, setValue] = useState("");
  const [lastState, setLastState] = useState(state);

  // Adjusting state during render rather than in an effect (the pattern React
  // documents for "state derived from a prop change"): typing is untouched,
  // but each action result re-seeds the field — a failure returns the text so
  // it survives, a success returns nothing so the field empties.
  if (lastState !== state) {
    setLastState(state);
    setValue(state.value ?? "");
  }

  const isEmpty = value.trim().length === 0;

  return (
    <form
      action={formAction}
      className="flex-none border-t border-kasa-gray-light bg-kasa-white px-6 py-5"
    >
      <input type="hidden" name="recipientId" value={recipientId} />
      {propertyId && (
        <input type="hidden" name="propertyId" value={propertyId} />
      )}

      <label htmlFor="message-body" className="sr-only">
        Votre message
      </label>

      {/* One line tall like the mockup, the button's height. Where
          `field-sizing` is supported the field grows with a long message up
          to max-h-32; elsewhere it stays one line and scrolls. */}
      <div className="flex items-end gap-2 rounded-xl border border-kasa-gray-light p-1.5 pl-4 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-kasa-red">
        <textarea
          id="message-body"
          name="body"
          rows={1}
          placeholder="Envoyer un message"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="field-sizing-content max-h-32 min-h-8 min-w-0 flex-1 resize-none bg-kasa-white py-1.5 text-sm leading-5 outline-none"
        />

        <button
          type="submit"
          aria-label="Envoyer"
          disabled={pending || isEmpty}
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-kasa-red text-kasa-white disabled:opacity-50"
        >
          <ArrowUpIcon />
        </button>
      </div>

      {state.error && (
        <p role="alert" aria-live="polite" className="mt-2 text-sm text-kasa-red">
          {state.error}
        </p>
      )}
    </form>
  );
}
