import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import MarkThreadRead from "@/components/messaging/MarkThreadRead";
import MessageThreadView from "@/components/messaging/MessageThreadView";
import ThreadList from "@/components/messaging/ThreadList";
import { ApiError } from "@/lib/api-client";
import { sendMessageAction } from "@/lib/messages-actions";
import { getThread, getThreads } from "@/lib/messages-api";
import { getPropertyById } from "@/lib/properties";
import { getSessionUser } from "@/lib/session";
import type {
  MessageThread,
  PropertyContext,
  ThreadSummary,
} from "@/types/message";

const UNAVAILABLE = "La messagerie est indisponible. Réessayez plus tard.";

/** Positive integers only: `abc`, `-1`, `1.5` and `01x` all fail. */
function parseContactId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) {
    return null;
  }

  const id = Number(raw);

  return id > 0 ? id : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/messagerie/[contactId]">): Promise<Metadata> {
  const { contactId } = await params;
  const id = parseContactId(contactId);

  if (id === null) {
    return { title: "Messagerie" };
  }

  try {
    const thread = await getThread(id);

    return { title: `Messagerie — ${thread.user.name}` };
  } catch {
    return { title: "Messagerie" };
  }
}

export default async function ThreadPage({
  params,
  searchParams,
}: PageProps<"/messagerie/[contactId]">) {
  const { contactId } = await params;
  const id = parseContactId(contactId);

  if (id === null) {
    notFound();
  }

  const user = await getSessionUser();

  if (!user) {
    redirect("/connexion");
  }

  if (id === user.id) {
    redirect("/messagerie");
  }

  let threads: ThreadSummary[] = [];
  let threadsFailed = false;

  try {
    threads = await getThreads();
  } catch (error) {
    if (error instanceof ApiError) {
      threadsFailed = true;
    } else {
      throw error;
    }
  }

  let thread: MessageThread | null = null;
  let threadFailed = false;
  let threadMissing = false;

  try {
    thread = await getThread(id);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        threadMissing = true;
      } else {
        threadFailed = true;
      }
    } else {
      throw error;
    }
  }

  // Outside the try block: notFound() signals by throwing, and the catch above
  // would otherwise swallow it.
  if (threadMissing) {
    notFound();
  }

  // Explicit URL context wins over the thread's own, so arriving from a second
  // property switches the subject instead of inheriting the first. An id the
  // API cannot resolve falls back rather than reaching the composer, so an
  // unknown property can never be submitted.
  let currentProperty: PropertyContext | null = thread?.property ?? null;
  const { logement } = await searchParams;

  if (typeof logement === "string" && logement) {
    try {
      const property = await getPropertyById(logement);

      if (property) {
        currentProperty = {
          id: property.id,
          slug: property.slug,
          title: property.title,
        };
      }
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error;
      }
    }
  }

  return (
    <>
      <div className="hidden w-full flex-col border-kasa-gray-light lg:flex lg:w-[370px] lg:flex-none lg:border-r">
        {threadsFailed ? (
          <p className="p-6 text-sm text-kasa-gray-dark">{UNAVAILABLE}</p>
        ) : (
          <ThreadList threads={threads} activeUserId={id} />
        )}
      </div>

      <div className="flex w-full flex-col lg:flex-1">
        {threadFailed || !thread ? (
          <p className="p-6 text-sm text-kasa-gray-dark">{UNAVAILABLE}</p>
        ) : (
          <>
            <MessageThreadView
              thread={thread}
              currentUserId={user.id}
              currentProperty={currentProperty}
              action={sendMessageAction}
            />
            <MarkThreadRead contactId={id} />
          </>
        )}
      </div>
    </>
  );
}
