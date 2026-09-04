/** Send glyph for the composer button. Decorative: the button's aria-label names it. */
export default function ArrowUpIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 flex-none"
    >
      <path d="M12 19V5m0 0-6 6m6-6 6 6" />
    </svg>
  );
}
