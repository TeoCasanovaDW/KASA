import Link from "next/link";
import ArrowLeftIcon from "@/components/icons/ArrowLeftIcon";
import MessageBubble from "@/components/messaging/MessageBubble";
import MessageComposer from "@/components/messaging/MessageComposer";
import type { MessageFormState } from "@/lib/messages-actions";
import { groupMessagesByDay } from "@/lib/messages-format";
import type { MessageThread, PropertyContext } from "@/types/message";

// Own messages carry no name of their own: the props deliberately give this
// component the partner's identity and the current user's id, never the
// current user's name. `Vous` is the French UI convention and keeps the
// forbidden `Utilisateur` placeholder out of the thread (D2).
const OWN_LABEL = "Vous";

export default function MessageThreadView({
  thread,
  currentUserId,
  currentProperty,
  action,
}: {
  thread: MessageThread;
  currentUserId: number;
  currentProperty: PropertyContext | null;
  action: (
    state: MessageFormState,
    formData: FormData
  ) => Promise<MessageFormState>;
}) {
  const groups = groupMessagesByDay(thread.messages);

  return (
    <div className="flex h-full flex-col bg-kasa-light-orange">
      <div className="flex-none border-b border-kasa-gray-light bg-kasa-white px-6 py-4">
        <Link
          href="/messagerie"
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-kasa-gray-light px-4 py-2 text-sm lg:hidden"
        >
          <ArrowLeftIcon />
          Retour
        </Link>

        <p className="font-semibold text-kasa-black">{thread.user.name}</p>

        {currentProperty && (
          <p className="mt-1 text-sm text-kasa-gray-dark">
            À propos de :{" "}
            <Link
              href={`/logements/${currentProperty.slug}`}
              className="underline"
            >
              {currentProperty.title}
            </Link>
          </p>
        )}
      </div>

      <div className="flex-1 space-y-6 p-6 lg:overflow-y-auto">
        {thread.messages.length === 0 ? (
          <p className="text-sm text-kasa-gray-dark">
            Aucun message. Écrivez le premier.
          </p>
        ) : (
          groups.map((group, index) => (
            <div key={group.day} className="space-y-6">
              {/* The first day carries no separator, matching the mockup. */}
              {index > 0 && (
                <div className="flex items-center gap-4">
                  <hr className="flex-1 border-kasa-gray-light" />
                  <span className="text-xs text-kasa-gray-dark">
                    {group.day}
                  </span>
                  <hr className="flex-1 border-kasa-gray-light" />
                </div>
              )}

              {group.messages.map((message) => {
                const isOwn = message.sender_id === currentUserId;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    participantName={isOwn ? OWN_LABEL : thread.user.name}
                    isOwn={isOwn}
                  />
                );
              })}
            </div>
          ))
        )}
      </div>

      <MessageComposer
        action={action}
        recipientId={thread.user.id}
        propertyId={currentProperty?.id}
      />
    </div>
  );
}
