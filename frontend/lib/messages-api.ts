import { apiFetch, ApiError } from "./api-client";
import { getSessionToken } from "./session";
import type { MessageThread, ThreadMessage, ThreadSummary } from "@/types/message";

// Server-only: every call needs the session's JWT and must never be cached,
// since the response is scoped to whichever user is signed in.

async function authInit(): Promise<RequestInit> {
  const token = await getSessionToken();

  if (!token) {
    throw new ApiError("authentication required", 401);
  }

  return {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  };
}

/** Wraps GET /api/messages. */
export async function getThreads(): Promise<ThreadSummary[]> {
  return apiFetch<ThreadSummary[]>("/api/messages", await authInit());
}

/** Wraps GET /api/messages/:userId. */
export async function getThread(userId: number): Promise<MessageThread> {
  return apiFetch<MessageThread>(
    `/api/messages/${userId}`,
    await authInit()
  );
}

/** Wraps POST /api/messages. */
export async function sendMessage(input: {
  recipientId: number;
  body: string;
  propertyId?: string;
}): Promise<ThreadMessage> {
  const init = await authInit();

  return apiFetch<ThreadMessage>("/api/messages", {
    ...init,
    method: "POST",
    headers: {
      ...init.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient_id: input.recipientId,
      body: input.body,
      property_id: input.propertyId,
    }),
  });
}

/** Wraps PATCH /api/messages/:userId/read. */
export async function markThreadRead(
  userId: number
): Promise<{ ok: true; updated: number }> {
  const init = await authInit();

  return apiFetch<{ ok: true; updated: number }>(
    `/api/messages/${userId}/read`,
    { ...init, method: "PATCH" }
  );
}
