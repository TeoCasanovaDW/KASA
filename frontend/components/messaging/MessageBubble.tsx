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
        {/* The mockup draws a plain dark square here, not the participant's
            photo, on both sides of the thread. */}
        <span
          aria-hidden="true"
          className="h-8 w-8 flex-none rounded-md bg-kasa-gray-dark"
        />
        <p className="text-xs text-kasa-gray-dark">
          {participantName} • {formatListTime(message.created_at)}
        </p>
      </div>

      <p
        className={`mt-2 max-w-md rounded-2xl px-4 py-3 text-sm break-words ${
          isOwn
            ? "bg-kasa-dark-orange text-kasa-white"
            : "bg-kasa-white text-kasa-black shadow-sm"
        }`}
      >
        {message.body}
      </p>
    </div>
  );
}
