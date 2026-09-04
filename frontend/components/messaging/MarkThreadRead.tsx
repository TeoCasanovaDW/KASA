"use client";

import { useEffect } from "react";
import { markThreadReadAction } from "@/lib/messages-actions";

/**
 * Renders nothing; it exists for its effect.
 *
 * Mount-time rather than render-time is the whole point: Next prefetches
 * `<Link>` targets, which renders this route's payload on the server without
 * ever running the effect. Hovering a conversation in the list therefore
 * leaves it unread, and only really opening the thread clears the dot.
 */
export default function MarkThreadRead({ contactId }: { contactId: number }) {
  useEffect(() => {
    void markThreadReadAction(contactId);
  }, [contactId]);

  return null;
}
