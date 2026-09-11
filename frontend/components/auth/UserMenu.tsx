"use client";

import { useEffect, useId, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";

const AVATAR_SIZE = 36;

/**
 * The header's account control: the user's avatar as a disclosure trigger for
 * a small menu holding the logout form. `logoutAction` is passed in rather
 * than imported so this stays a plain Client Component (see MessageComposer
 * for the same arrangement).
 */
export default function UserMenu({
  name,
  picture,
  logoutAction,
  showName = false,
}: {
  name: string;
  picture: string | null;
  logoutAction: () => Promise<void>;
  showName?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    menuRef.current?.querySelector("button")?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setOpen(false);
      triggerRef.current?.focus();
    }

    // The two dismissals Escape does not cover: a click elsewhere, and focus
    // leaving the menu (tabbing past its last item).
    function handleOutside(event: Event) {
      if (containerRef.current?.contains(event.target as Node)) return;

      setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("focusin", handleOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("focusin", handleOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        ref={triggerRef}
        type="button"
        // Label-in-name: it starts with the visible first name when shown.
        aria-label={`${name}, ouvrir le menu du compte`}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-3"
      >
        <Avatar src={picture} size={AVATAR_SIZE} rounded="rounded-full" />
        {showName && <span>{name}</span>}
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          className="absolute top-full right-0 z-50 mt-2 min-w-40 rounded-lg bg-kasa-white p-2 text-sm shadow-md"
        >
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-md px-3 py-2 text-left"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
