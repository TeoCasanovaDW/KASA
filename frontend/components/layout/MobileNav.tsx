"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/layout/Logo";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

const LINK_CLASSES = "block py-7 text-2xl";

export default function MobileNav() {
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
          className="fixed inset-0 z-50 flex flex-col bg-kasa-white px-4 md:hidden"
        >
          <div className="flex items-center justify-between py-4">
            <Logo variant="icon" />
            <button type="button" aria-label="Fermer le menu" onClick={close}>
              <CloseIcon />
            </button>
          </div>

          <nav aria-label="Navigation mobile">
            <ul className="divide-y divide-kasa-gray-light">
              <li>
                <Link
                  ref={firstLinkRef}
                  href="/"
                  onClick={close}
                  className={LINK_CLASSES}
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/a-propos" onClick={close} className={LINK_CLASSES}>
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/messagerie"
                  onClick={close}
                  className={LINK_CLASSES}
                >
                  Messagerie
                </Link>
              </li>
              <li>
                <Link href="/favoris" onClick={close} className={LINK_CLASSES}>
                  Favoris
                </Link>
              </li>
            </ul>
            <Link
              href="/ajouter-un-logement"
              onClick={close}
              className="mt-3 inline-block w-50 rounded-lg bg-kasa-red py-2 text-center text-sm text-kasa-white"
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
      viewBox="0 0 28 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      className="h-5 w-7 text-kasa-gray-dark"
    >
      <path d="M8.5 1.5h18M1.5 10h25M14.5 18.5h12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className="h-7 w-7 text-kasa-black"
    >
      <path d="M2 2l24 24M26 2 2 26" />
    </svg>
  );
}
