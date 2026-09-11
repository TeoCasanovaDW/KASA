import Avatar from "@/components/ui/Avatar";
import { formatListTime } from "@/lib/messages-format";
import type { ThreadMessage } from "@/types/message";

const AVATAR_SIZE = 32;

export default function MessageBubble({
  message,
  participantName,
  picture,
  isOwn,
}: {
  message: ThreadMessage;
  participantName: string;
  picture: string | null;
  isOwn: boolean;
}) {
  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div
        className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
      >
        {/* Each bubble carries its own sender's photo, so a thread shows both
            interlocutors; Avatar falls back to the neutral silhouette when the
            picture is missing. */}
        <Avatar src={picture} size={AVATAR_SIZE} />
        <p className="text-xs text-kasa-gray-dark">
          {participantName} • {formatListTime(message.created_at)}
        </p>
      </div>

      {/* The mockup lines the bubble up with the meta line rather than the
          avatar, so it clears the avatar column: 32px square + the 8px gap. */}
      <p
        className={`mt-2 max-w-sm rounded-2xl px-4 py-3 text-sm break-words ${
          isOwn
            ? "mr-10 bg-kasa-dark-orange text-kasa-white"
            : "ml-10 bg-kasa-white text-kasa-black shadow-sm"
        }`}
      >
        {message.body}
      </p>
    </div>
  );
}
