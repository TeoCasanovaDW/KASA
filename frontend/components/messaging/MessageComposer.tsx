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
      className="flex-none border-t border-kasa-gray-light bg-kasa-white p-6"
    >
      <input type="hidden" name="recipientId" value={recipientId} />
      {propertyId && (
        <input type="hidden" name="propertyId" value={propertyId} />
      )}

      <label htmlFor="message-body" className="sr-only">
        Votre message
      </label>

      <div className="relative rounded-xl border border-kasa-gray-light">
        <textarea
          id="message-body"
          name="body"
          rows={3}
          placeholder="Envoyer un message"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full resize-none rounded-xl bg-kasa-white p-4 pr-16 text-sm outline-none"
        />

        <button
          type="submit"
          aria-label="Envoyer"
          disabled={pending || isEmpty}
          className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-md bg-kasa-red text-kasa-white disabled:opacity-50"
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
