"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/layout/Logo";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

export default function MobileNav({
  authSlot,
}: {
  authSlot: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        FOCUSABLE_SELECTOR,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden"
      >
        <HamburgerIcon />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed inset-0 z-50 flex flex-col bg-kasa-white p-6 md:hidden"
        >
          <div className="flex items-center justify-between">
            <Logo variant="icon" />
            <button type="button" aria-label="Fermer le menu" onClick={close}>
              <CloseIcon />
            </button>
          </div>

          <nav
            aria-label="Navigation mobile"
            className="mt-10 flex flex-col gap-6 text-lg"
          >
            <Link ref={firstLinkRef} href="/" onClick={close}>
              Accueil
            </Link>
            <Link href="/a-propos" onClick={close}>
              À propos
            </Link>
            <Link href="/messagerie" onClick={close}>
              Messagerie
            </Link>
            <Link href="/favoris" onClick={close}>
              Favoris
            </Link>
            {/* Server-rendered auth state; the wrapper keeps this slot's
                previous close-on-click behavior, which its content cannot
                reach from the server. */}
            <div onClick={close}>{authSlot}</div>
            <Link
              href="/ajouter-un-logement"
              onClick={close}
              className="rounded-full bg-kasa-red px-4 py-3 text-center text-kasa-white"
            >
              Ajouter un logement
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-kasa-black"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-kasa-black"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
