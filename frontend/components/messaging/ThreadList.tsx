import Image from "next/image";
import Link from "next/link";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import { formatListTime, truncate } from "@/lib/messages-format";
import type { ThreadSummary } from "@/types/message";

const AVATAR_SIZE = 44;
const PREVIEW_MAX = 38;

export default function ThreadList({
  threads,
  activeUserId,
}: {
  threads: ThreadSummary[];
  activeUserId?: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-none px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-kasa-gray-light px-4 py-2 text-sm"
        >
          <ArrowLeftIcon />
          Retour
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-kasa-black">Messages</h1>
      </div>

      {threads.length === 0 ? (
        <p className="px-6 py-8 text-sm text-kasa-gray-dark">
          Aucune conversation pour le moment. Consultez un logement pour contacter un hôte.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-kasa-gray-light lg:overflow-y-auto">
          {threads.map((thread) => (
            <li key={thread.user.id}>
              <Link
                href={`/messagerie/${thread.user.id}`}
                className={`flex items-center gap-3 px-6 py-4 ${
                  thread.user.id === activeUserId ? "bg-kasa-light-orange" : ""
                }`}
              >
                {thread.user.picture ? (
                  <Image
                    src={thread.user.picture}
                    alt=""
                    width={AVATAR_SIZE}
                    height={AVATAR_SIZE}
                    className="h-11 w-11 flex-none rounded-md object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 flex-none rounded-md bg-kasa-gray-light" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold text-kasa-black">
                      {thread.user.name}
                    </span>
                    <span className="flex-none text-xs text-kasa-gray-dark">
                      {formatListTime(thread.last_message.created_at)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-kasa-gray-dark">
                      {truncate(thread.last_message.body, PREVIEW_MAX)}
                    </span>
                    {thread.unread_count > 0 && (
                      <span
                        role="img"
                        aria-label="Messages non lus"
                        className="h-2 w-2 flex-none rounded-full bg-kasa-red"
                      />
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
