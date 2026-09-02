"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

export default function CarouselOverlay({
  pictures,
  startIndex,
  title,
  onClose,
}: {
  pictures: string[];
  startIndex: number;
  title: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const total = pictures.length;
  const hasMultiple = total > 1;

  // Mount-only: move focus into the dialog, then hand it back to whatever
  // held it before (the gallery tile that opened the overlay).
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    return () => previouslyFocused?.focus();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight" && total > 1) {
        setIndex((current) => (current + 1) % total);
        return;
      }

      if (event.key === "ArrowLeft" && total > 1) {
        setIndex((current) => (current - 1 + total) % total);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable =
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
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
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [total, onClose]);

  function goPrevious() {
    setIndex((current) => (current - 1 + total) % total);
  }

  function goNext() {
    setIndex((current) => (current + 1) % total);
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-kasa-black/80 p-4"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Galerie photos"
        className="w-full max-w-4xl"
      >
        <div className="flex justify-end">
          <button
            ref={closeRef}
            type="button"
            aria-label="Fermer la galerie"
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-kasa-white"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative mx-auto aspect-[16/10] max-h-[80vh] w-full overflow-hidden rounded-lg">
          <Image
            src={pictures[index]}
            alt={`${title} — photo ${index + 1} sur ${total}`}
            fill
            className="object-cover motion-safe:transition-opacity"
            sizes="(min-width: 768px) 80vw, 100vw"
          />

          {hasMultiple && (
            <>
              <button
                type="button"
                aria-label="Image précédente"
                onClick={goPrevious}
                className="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full bg-kasa-black/60 p-2 text-kasa-white"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                aria-label="Image suivante"
                onClick={goNext}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full bg-kasa-black/60 p-2 text-kasa-white"
              >
                <ChevronIcon direction="right" />
              </button>
            </>
          )}
        </div>

        {hasMultiple && (
          <p className="mt-3 text-center text-sm text-kasa-white">
            {index + 1} / {total}
          </p>
        )}
      </div>
    </div>
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
      className="h-6 w-6"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
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
      className="h-6 w-6"
    >
      <path d={direction === "left" ? "M15 18 9 12l6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}
