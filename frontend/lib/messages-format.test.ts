import { describe, expect, it } from "vitest";
import type { ThreadMessage } from "@/types/message";
import {
  formatDaySeparator,
  formatListTime,
  groupMessagesByDay,
  truncate,
} from "./messages-format";

// The helpers turn a UTC ISO string into local-time French text, so the
// fixtures are built from a local date and converted back with
// `toISOString()`. The expectations then hold whatever `TZ` the machine runs
// in, instead of only passing in UTC.
function iso(day: number, hours: number, minutes: number): string {
  return new Date(2025, 8, day, hours, minutes).toISOString();
}

function message(id: number, createdAt: string): ThreadMessage {
  return {
    id,
    sender_id: 4,
    recipient_id: 1,
    body: `Message ${id}`,
    created_at: createdAt,
    read_at: null,
  };
}

describe("formatListTime", () => {
  it("renders a UTC ISO string as a 24-hour time", () => {
    expect(formatListTime(iso(3, 11, 4))).toBe("11:04");
  });

  it("keeps the 24-hour clock in the afternoon", () => {
    expect(formatListTime(iso(3, 23, 4))).toBe("23:04");
  });
});

describe("formatDaySeparator", () => {
  it("renders the French month name", () => {
    expect(formatDaySeparator(iso(3, 11, 4))).toBe("03 septembre 2025");
  });
});

describe("groupMessagesByDay", () => {
  it("splits two calendar days and keeps the order within each", () => {
    const groups = groupMessagesByDay([
      message(1, iso(3, 11, 4)),
      message(2, iso(3, 14, 30)),
      message(3, iso(4, 9, 0)),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].day).toBe("03 septembre 2025");
    expect(groups[0].messages.map((m) => m.id)).toEqual([1, 2]);
    expect(groups[1].day).toBe("04 septembre 2025");
    expect(groups[1].messages.map((m) => m.id)).toEqual([3]);
  });

  it("returns no group for an empty history", () => {
    expect(groupMessagesByDay([])).toEqual([]);
  });
});

describe("truncate", () => {
  it("leaves a short text untouched", () => {
    expect(truncate("Bonjour", 20)).toBe("Bonjour");
  });

  it("cuts a long text and appends an ellipsis", () => {
    expect(truncate("Bonjour tout le monde", 7)).toBe("Bonjour…");
  });

  it("drops the trailing space left by the cut", () => {
    expect(truncate("Bonjour tout le monde", 8)).toBe("Bonjour…");
  });
});
