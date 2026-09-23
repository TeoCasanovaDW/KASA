"use client";

import { useRef, useState, useTransition } from "react";
import TrashIcon from "@/components/icons/TrashIcon";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deletePropertyAction } from "@/lib/property-actions";
import type { Property } from "@/types/property";

/**
 * Opens a confirmation dialog, then runs `deletePropertyAction`. On success
 * the action redirects to `/mes-annonces`; on failure the dialog stays open
 * with the error. `icon` is the card badge, sized like FavoriteButton's `sm`
 * so it sits in PropertyCard's `favoriteControl` slot; `full` is HostCard's
 * red full-width button, in place of "Envoyer un message".
 */
export default function DeletePropertyButton({
  propertyId,
  propertyTitle,
  variant = "icon",
}: {
  propertyId: Property["id"];
  propertyTitle: string;
  variant?: "icon" | "full";
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    setError(null);
    buttonRef.current?.focus();
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await deletePropertyAction(propertyId);
      setError(result.error);
    });
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          ref={buttonRef}
          type="button"
          aria-label={`Supprimer l'annonce « ${propertyTitle} »`}
          onClick={() => setOpen(true)}
          className="flex h-7 w-7 flex-none cursor-pointer items-center justify-center rounded-md bg-kasa-white text-kasa-gray-dark hover:text-kasa-red"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full cursor-pointer rounded-xl bg-kasa-red py-3 text-center text-kasa-white"
        >
          Supprimer l&apos;annonce
        </button>
      )}

      {open && (
        <ConfirmDialog
          title="Supprimer cette annonce ?"
          message={`« ${propertyTitle} » sera définitivement supprimée. Cette action est irréversible.`}
          confirmLabel="Supprimer"
          pendingLabel="Suppression…"
          pending={pending}
          error={error}
          onConfirm={confirm}
          onCancel={close}
        />
      )}
    </>
  );
}
