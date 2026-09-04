import type { ThreadMessage } from "@/types/message";

// Pure formatting helpers, no React. French 24-hour times and lowercase month
// names throughout, which diverges from the mockup's `11:04 am` /
// `03 Septembre 2025` on purpose (see the spec's `## Mockup divergences`).
// The API sends UTC ISO strings; formatting renders them in local time.

const LIST_TIME = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DAY_SEPARATOR = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** `2025-09-03T11:04:00Z` -> `11:04`. */
export function formatListTime(iso: string): string {
  return LIST_TIME.format(new Date(iso));
}

/** `2025-09-03T11:04:00Z` -> `03 septembre 2025`. */
export function formatDaySeparator(iso: string): string {
  return DAY_SEPARATOR.format(new Date(iso));
}

/**
 * Splits an already-ordered list into consecutive runs sharing a calendar day.
 * The separator label doubles as the grouping key: it carries day, month and
 * year, so two different days can never collapse into one group.
 */
export function groupMessagesByDay(
  messages: ThreadMessage[]
): { day: string; messages: ThreadMessage[] }[] {
  const groups: { day: string; messages: ThreadMessage[] }[] = [];

  for (const message of messages) {
    const day = formatDaySeparator(message.created_at);
    const current = groups[groups.length - 1];

    if (current && current.day === day) {
      current.messages.push(message);
    } else {
      groups.push({ day, messages: [message] });
    }
  }

  return groups;
}

/** One-line preview: cuts to `max` characters and appends an ellipsis. */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}
