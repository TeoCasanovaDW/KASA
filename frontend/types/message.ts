// Mirrors GET /api/messages, GET /api/messages/:userId and POST /api/messages
// (backend/services/messagesService.js).

export type MessageParticipant = {
  id: number;
  name: string;
  picture: string | null;
};

export type ThreadMessage = {
  id: number;
  sender_id: number;
  recipient_id: number;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type ThreadSummary = {
  user: MessageParticipant;
  last_message: {
    id: number;
    body: string;
    created_at: string;
    sender_id: number;
  };
  unread_count: number;
};

/** The property a thread is about, as carried by a message or by `?logement=`. */
export type PropertyContext = {
  id: string;
  slug: string;
  title: string;
};

export type MessageThread = {
  user: MessageParticipant;
  property: PropertyContext | null;
  messages: ThreadMessage[];
};
