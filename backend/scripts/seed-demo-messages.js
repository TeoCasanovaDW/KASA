/**
 * Local development only — seeds realistic demo conversations for the messaging
 * UI. Not wired into the app: run it by hand from the `backend` directory with
 * `node scripts/seed-demo-messages.js`.
 *
 * It writes through the real `db.js` module into the real `messages` table, so
 * `GET /api/messages`, `GET /api/messages/:id` and the unread logic all see this
 * data exactly as they would see messages sent from the UI. Nothing about the
 * schema, the services or the routes is touched.
 *
 * Re-running is safe: the script first deletes the rows it inserted last time,
 * matched on their exact bodies. Any message it did not author — the protected
 * one below included — is left alone.
 */

const { initialize } = require('../db');
const { listThreads } = require('../services/messagesService');

// Sent from the real account through the UI. Must survive every run.
const PROTECTED_BODY =
  "Bonjour, je vous contacte par rapport à votre bien j'aurais aimé avoir plus de photos si possible";

const ME_EMAIL = 'teo.casanova13@gmail.com';

/**
 * One entry per conversation. `from` is either 'me' or 'them'; timestamps are
 * UTC in the same `YYYY-MM-DD HH:MM:SS` shape SQLite's CURRENT_TIMESTAMP writes,
 * and `read` decides whether the recipient has opened the message yet — an
 * incoming message left unread is what lights the red dot in the thread list.
 */
const CONVERSATIONS = [
  {
    host: 'Nathalie Jean',
    property: 'c67ab8a7',
    messages: [
      // The protected message opens this thread on 2026-09-04 at 13:38 UTC.
      { from: 'them', at: '2026-09-04 14:12:00', read: true, body: "Bonjour Téo, merci pour votre message ! Je vous envoie une série de photos supplémentaires du salon et de la chambre dans la journée." },
      { from: 'them', at: '2026-09-04 17:45:00', read: true, body: "Voilà, j'ai ajouté six nouvelles photos à l'annonce, dont la cuisine et la vue depuis le balcon." },
      { from: 'me', at: '2026-09-05 08:22:00', read: true, body: "Merci beaucoup, c'est exactement ce que je cherchais. L'appartement est-il disponible du 12 au 14 octobre ?" },
      { from: 'them', at: '2026-09-05 09:05:00', read: true, body: 'Oui, ces dates sont encore libres. Le tarif est de 128 € la nuit, ménage inclus.' },
      { from: 'me', at: '2026-09-05 09:31:00', read: true, body: "Parfait. Est-ce qu'il y a un parking à proximité ?" },
      { from: 'them', at: '2026-09-05 10:14:00', read: true, body: "Il y a un parking souterrain à 150 mètres, environ 18 € la journée. Je peux vous donner le code d'accès à votre arrivée." },
      { from: 'me', at: '2026-09-06 09:02:00', read: true, body: 'Très bien, je réserve pour ces dates. Faut-il verser un acompte ?' },
      { from: 'them', at: '2026-09-06 09:40:00', read: true, body: "Un acompte de 30 % suffit pour bloquer les dates. Je vous envoie le lien de paiement par mail, et je reste disponible si vous avez d'autres questions d'ici là." },
    ],
  },
  {
    host: 'Della Case',
    property: 'b9123946',
    messages: [
      { from: 'me', at: '2026-09-06 15:10:00', read: true, body: 'Bonjour Della, votre appartement près du Canal Saint-Martin est-il disponible le week-end du 3 octobre ?' },
      { from: 'them', at: '2026-09-06 16:02:00', read: false, body: 'Bonjour ! Oui, le week-end du 3 octobre est disponible, je viens de libérer les dates.' },
      { from: 'them', at: '2026-09-06 16:04:00', read: false, body: 'Dites-moi si vous souhaitez que je vous réserve le créneau, je le garde 48 heures.' },
    ],
  },
  {
    host: 'Sébastien Fournier',
    property: 'bc6f7112',
    messages: [
      { from: 'me', at: '2026-09-05 18:30:00', read: true, body: "Bonjour, l'appartement accepte-t-il les séjours de deux semaines ?" },
      { from: 'them', at: '2026-09-05 19:12:00', read: true, body: "Bonsoir, oui bien sûr, à partir de sept nuits j'applique même une remise de 10 %." },
      { from: 'them', at: '2026-09-07 08:15:00', read: false, body: "Bonjour Téo, petite mise à jour : la chambre a été repeinte et j'ai changé le canapé du salon." },
      { from: 'them', at: '2026-09-07 08:16:00', read: false, body: 'Je mettrai les nouvelles photos en ligne ce soir.' },
      { from: 'them', at: '2026-09-07 08:41:00', read: false, body: "Si vous avez une préférence pour les dates de novembre, n'hésitez pas à me le dire rapidement, le mois se remplit vite." },
    ],
  },
  {
    host: 'Adrien Chiran',
    property: 'cb2f9222',
    messages: [
      { from: 'me', at: '2026-09-02 10:05:00', read: true, body: 'Bonjour, nous serions quatre adultes et deux enfants, la suite familiale peut-elle nous accueillir confortablement ? Nous cherchons un logement calme, avec si possible un lit parapluie et une place de stationnement à proximité.' },
      { from: 'them', at: '2026-09-02 11:20:00', read: true, body: "Bonjour, la suite dispose de deux chambres doubles et d'un canapé-lit, donc six personnes sans problème. Je fournis le lit parapluie et la chaise haute sur simple demande, et le stationnement résidentiel est gratuit le week-end." },
      { from: 'me', at: '2026-09-02 11:52:00', read: true, body: 'Merci pour ces précisions, je reviens vers vous très vite.' },
    ],
  },
  {
    // No property on purpose: covers the thread header without the "À propos de" line.
    host: 'Karen Guillet',
    property: null,
    messages: [
      { from: 'me', at: '2026-08-30 14:00:00', read: true, body: 'Bonjour, auriez-vous encore des disponibilités fin novembre ?' },
      { from: 'them', at: '2026-08-30 15:26:00', read: true, body: 'Bonjour, il me reste la semaine du 24 au 30 novembre.' },
      { from: 'me', at: '2026-08-30 15:40:00', read: true, body: 'Parfait, merci !' },
    ],
  },
  {
    host: 'Julie Donatella',
    property: '1e181317',
    messages: [
      { from: 'me', at: '2026-08-24 09:12:00', read: true, body: "Bonjour, le loft dispose-t-il d'un espace de travail avec une bonne connexion ?" },
      { from: 'them', at: '2026-08-24 12:47:00', read: true, body: 'Bonjour, oui : bureau, écran externe et fibre 1 Gb/s. Beaucoup de mes voyageurs sont en télétravail.' },
    ],
  },
];

/** read_at lands a few minutes after the message, never before it. */
function readAtFor(at) {
  const stamp = new Date(`${at.replace(' ', 'T')}Z`);
  stamp.setUTCMinutes(stamp.getUTCMinutes() + 7);
  return stamp.toISOString().slice(0, 19).replace('T', ' ');
}

async function main() {
  const db = await initialize();

  const me = await db.getAsync('SELECT id, name FROM users WHERE email = ?', [ME_EMAIL]);
  if (!me) throw new Error(`No user with email ${ME_EMAIL}; sign up first.`);

  const protectedRow = await db.getAsync('SELECT id FROM messages WHERE body = ?', [PROTECTED_BODY]);
  if (!protectedRow) {
    throw new Error('The protected message is missing from the database — refusing to seed.');
  }

  const bodies = CONVERSATIONS.flatMap(c => c.messages.map(m => m.body));
  if (bodies.includes(PROTECTED_BODY)) {
    throw new Error('A seeded body collides with the protected message — refusing to seed.');
  }

  // Clear only what a previous run of this script inserted.
  const placeholders = bodies.map(() => '?').join(',');
  const removed = await db.runAsync(
    `DELETE FROM messages WHERE body IN (${placeholders}) AND id <> ?`,
    [...bodies, protectedRow.id]
  );
  if (removed.changes) console.log(`Removed ${removed.changes} row(s) from a previous seed.`);

  let inserted = 0;

  for (const conversation of CONVERSATIONS) {
    const host = await db.getAsync('SELECT id, name FROM users WHERE name = ?', [conversation.host]);
    if (!host) throw new Error(`Unknown host "${conversation.host}" — aborting.`);

    if (conversation.property) {
      const property = await db.getAsync('SELECT id FROM properties WHERE id = ?', [conversation.property]);
      if (!property) throw new Error(`Unknown property "${conversation.property}" — aborting.`);
    }

    for (const message of conversation.messages) {
      const senderId = message.from === 'me' ? me.id : host.id;
      const recipientId = message.from === 'me' ? host.id : me.id;

      await db.runAsync(
        'INSERT INTO messages(sender_id, recipient_id, property_id, body, created_at, read_at) VALUES (?,?,?,?,?,?)',
        [
          senderId,
          recipientId,
          conversation.property,
          message.body,
          message.at,
          message.read ? readAtFor(message.at) : null,
        ]
      );
      inserted += 1;
    }
  }

  console.log(`Inserted ${inserted} message(s) for ${me.name} (id ${me.id}).\n`);

  // Read the result back through the service the API route actually calls.
  const threads = await listThreads(db, me.id);
  console.log('Thread list as GET /api/messages returns it:');
  for (const thread of threads) {
    const unread = thread.unread_count > 0 ? `${thread.unread_count} unread` : 'read';
    console.log(
      `  id=${String(thread.user.id).padStart(2)}  ${thread.user.name.padEnd(20)}` +
      `${thread.last_message.created_at}  ${unread.padEnd(9)}  ${thread.last_message.body.slice(0, 42)}…`
    );
  }

  db.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
