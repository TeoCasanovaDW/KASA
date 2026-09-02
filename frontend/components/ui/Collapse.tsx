"use client";

import { useId, useState } from "react";

export default function Collapse({
  title,
  children,
  defaultOpen = true,
  headingLevel: Heading = "h2",
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div>
      <Heading>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((current) => !current)}
          className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kasa-red"
        >
          {title}
          <ChevronIcon
            className={`h-4 w-4 flex-none motion-safe:transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </Heading>
      <div id={contentId} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
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
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
