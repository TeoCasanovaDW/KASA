import Avatar from "@/components/ui/Avatar";
import { formatListTime } from "@/lib/messages-format";
import type { ThreadMessage } from "@/types/message";

export default function MessageBubble({
  message,
  participantName,
  isOwn,
}: {
  message: ThreadMessage;
  participantName: string;
  isOwn: boolean;
}) {
  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
      <div
        className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
      >
        <Avatar src={null} size={32} />
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
