const CREATED_AT = "strftime('%Y-%m-%dT%H:%M:%SZ', m.created_at) AS created_at";
const READ_AT = "strftime('%Y-%m-%dT%H:%M:%SZ', m.read_at) AS read_at";

function fail(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// Shared by getThread and markThreadRead: the id must be an integer and match a real user.
async function requireOtherUser(db, otherId) {
  if (!/^\d+$/.test(String(otherId ?? '').trim())) throw fail('invalid user id', 400);
  const id = Number(otherId);
  const user = await db.getAsync('SELECT id, name, picture FROM users WHERE id = ?', [id]);
  if (!user) throw fail('User not found', 404);
  return user;
}

async function listThreads(db, me) {
  const rows = await db.allAsync(`
    SELECT
      u.id AS user_id,
      u.name AS user_name,
      u.picture AS user_picture,
      MAX(m.id) AS last_id,
      m.body AS last_body,
      ${CREATED_AT},
      m.sender_id AS last_sender_id,
      (
        SELECT COUNT(*) FROM messages x
        WHERE x.sender_id = u.id AND x.recipient_id = ? AND x.read_at IS NULL
      ) AS unread_count
    FROM messages m
    JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END
    WHERE m.sender_id = ? OR m.recipient_id = ?
    GROUP BY u.id
    ORDER BY m.created_at DESC, m.id DESC
  `, [me, me, me, me]);

  return rows.map(row => ({
    user: { id: row.user_id, name: row.user_name, picture: row.user_picture },
    last_message: {
      id: row.last_id,
      body: row.last_body,
      created_at: row.created_at,
      sender_id: row.last_sender_id,
    },
    unread_count: row.unread_count,
  }));
}

// Read-only: never stamps read_at (Next.js prefetches the thread route).
async function getThread(db, me, otherId) {
  const user = await requireOtherUser(db, otherId);

  const messages = await db.allAsync(`
    SELECT m.id, m.sender_id, m.recipient_id, m.body, ${CREATED_AT}, ${READ_AT}
    FROM messages m
    WHERE (m.sender_id = ? AND m.recipient_id = ?)
       OR (m.sender_id = ? AND m.recipient_id = ?)
    ORDER BY m.created_at ASC, m.id ASC
  `, [me, user.id, user.id, me]);

  const property = await db.getAsync(`
    SELECT p.id, p.slug, p.title
    FROM messages m
    JOIN properties p ON p.id = m.property_id
    WHERE m.property_id IS NOT NULL
      AND ((m.sender_id = ? AND m.recipient_id = ?) OR (m.sender_id = ? AND m.recipient_id = ?))
    ORDER BY m.created_at DESC, m.id DESC
    LIMIT 1
  `, [me, user.id, user.id, me]);

  return {
    user: { id: user.id, name: user.name, picture: user.picture },
    property: property || null,
    messages,
  };
}

async function sendMessage(db, me, { recipientId, body, propertyId }) {
  const text = typeof body === 'string' ? body.trim() : '';
  if (!recipientId || !text) throw fail('recipient_id and body are required', 400);
  if (Number(recipientId) === Number(me)) throw fail('cannot message yourself', 400);

  const recipient = await db.getAsync('SELECT id FROM users WHERE id = ?', [recipientId]);
  if (!recipient) throw fail('User not found', 404);

  if (propertyId) {
    const property = await db.getAsync('SELECT id FROM properties WHERE id = ?', [propertyId]);
    if (!property) throw fail('Property not found', 404);
  }

  const ins = await db.runAsync(
    'INSERT INTO messages(sender_id, recipient_id, property_id, body) VALUES (?,?,?,?)',
    [me, recipient.id, propertyId || null, text]
  );

  return db.getAsync(`
    SELECT m.id, m.sender_id, m.recipient_id, m.body, ${CREATED_AT}, ${READ_AT}
    FROM messages m
    WHERE m.id = ?
  `, [ins.lastID]);
}

async function markThreadRead(db, me, otherId) {
  const user = await requireOtherUser(db, otherId);
  const res = await db.runAsync(
    'UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL',
    [user.id, me]
  );
  return { ok: true, updated: res.changes };
}

module.exports = {
  listThreads,
  getThread,
  sendMessage,
  markThreadRead,
};
