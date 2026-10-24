/**
 * Prepares the database for the oral: keeps only the two demo accounts and
 * gives each one a messaging inbox that shows every state (unread threads, read
 * threads, last message from the host, last message from the user).
 *
 * Run it by hand from the `backend` directory, on the machine that owns the
 * database (Railway shell for production):
 *   node scripts/seed-oral.js --dry-run   # shows what would happen, changes nothing
 *   node scripts/seed-oral.js             # applies it
 *
 * What it does, in one transaction (all or nothing):
 *   1. deletes every account that has an email, except the two demo accounts,
 *      together with their properties, favorites, ratings and messages;
 *   2. deletes every remaining message;
 *   3. inserts the conversations below, dated relative to now.
 * The hosts from the seed data (no email) and their properties are kept: they
 * are the people the demo accounts talk to. Passwords are not touched.
 */

const { initialize } = require('../db');
const { listThreads } = require('../services/messagesService');

const DRY_RUN = process.argv.includes('--dry-run');

const MIN = 1;
const HOUR = 60;
const DAY = 24 * HOUR;

// Each account can be written with or without the accent.
const CLIENT_EMAILS = ['client@gmail.com'];
const OWNER_EMAILS = ['proprietaire@gmail.com', 'propriétaire@gmail.com'];

/**
 * `from` is 'me' or 'them'; `ago` is how long before the run the message was
 * sent, in minutes; `read: false` on an incoming message is what lights the
 * unread dot in the thread list. Every conversation is about a property.
 */
const CLIENT_CONVERSATIONS = [
  {
    host: 'Nathalie Jean',
    property: 'c67ab8a7',
    messages: [
      { from: 'me', ago: 2 * DAY + 3 * HOUR, read: true, body: "Bonjour, l'appartement est-il disponible du 12 au 14 novembre ?" },
      { from: 'them', ago: 2 * DAY + 2 * HOUR, read: true, body: 'Bonjour, oui ces dates sont libres. Le tarif est de 128 € la nuit, ménage inclus.' },
      { from: 'them', ago: 20 * MIN, read: false, body: "J'ai ajouté de nouvelles photos du salon et de la chambre à l'annonce." },
      { from: 'them', ago: 18 * MIN, read: false, body: 'Dites-moi si vous souhaitez réserver, je bloque les dates.' },
    ],
  },
  {
    host: 'Della Case',
    property: 'b9123946',
    messages: [
      { from: 'me', ago: 5 * HOUR, read: true, body: 'Bonjour Della, votre appartement près du Canal Saint-Martin est-il disponible le week-end du 5 décembre ?' },
      { from: 'them', ago: 4 * HOUR, read: false, body: 'Bonjour ! Oui, ce week-end est disponible, je le garde pour vous pendant 48 heures.' },
    ],
  },
  {
    host: 'Karen Guillet',
    property: '7cbb378e',
    messages: [
      { from: 'me', ago: 3 * DAY, read: true, body: 'Bonjour, auriez-vous encore des disponibilités fin novembre ?' },
      { from: 'them', ago: DAY + 6 * HOUR, read: false, body: 'Bonjour, il me reste la semaine du 24 au 30 novembre.' },
      { from: 'them', ago: DAY + 5 * HOUR, read: false, body: 'Elle est à 540 € la semaine, charges comprises.' },
      { from: 'them', ago: DAY + 4 * HOUR, read: false, body: "Je peux vous envoyer le contrat par mail si cela vous convient." },
    ],
  },
  {
    host: 'Sébastien Fournier',
    property: 'bc6f7112',
    messages: [
      { from: 'me', ago: 4 * DAY, read: true, body: "Bonjour, l'appartement accepte-t-il les séjours de deux semaines ?" },
      { from: 'them', ago: 4 * DAY - 40 * MIN, read: true, body: "Bonsoir, oui bien sûr, à partir de sept nuits j'applique même une remise de 10 %." },
      { from: 'me', ago: 4 * DAY - 90 * MIN, read: true, body: 'Parfait, merci pour votre réponse rapide.' },
      { from: 'them', ago: 3 * DAY, read: true, body: "N'hésitez pas si vous avez d'autres questions avant de réserver." },
    ],
  },
  {
    host: 'Adrien Chiran',
    property: 'cb2f9222',
    messages: [
      { from: 'me', ago: 6 * DAY, read: true, body: 'Bonjour, nous serions quatre adultes et deux enfants, la suite familiale peut-elle nous accueillir confortablement ? Nous cherchons un logement calme, avec si possible un lit parapluie et une place de stationnement à proximité.' },
      { from: 'them', ago: 6 * DAY - 70 * MIN, read: true, body: 'Bonjour, la suite dispose de deux chambres doubles et d\'un canapé-lit, donc six personnes sans problème. Je fournis le lit parapluie sur simple demande.' },
      { from: 'me', ago: 6 * DAY - 100 * MIN, read: true, body: 'Merci pour ces précisions, je reviens vers vous très vite.' },
    ],
  },
  {
    host: 'Julie Donatella',
    property: '1e181317',
    messages: [
      { from: 'me', ago: 12 * DAY, read: true, body: "Bonjour, le loft dispose-t-il d'un espace de travail avec une bonne connexion ?" },
      { from: 'them', ago: 12 * DAY - 3 * HOUR, read: true, body: 'Bonjour, oui : bureau, écran externe et fibre 1 Gb/s. Beaucoup de mes voyageurs sont en télétravail.' },
    ],
  },
  {
    host: 'Franck Maher',
    property: '46d188c5',
    messages: [
      { from: 'me', ago: 9 * DAY, read: true, body: 'Bonjour, le studio est-il proche du métro ?' },
      { from: 'them', ago: 9 * DAY - 2 * HOUR, read: true, body: 'Bonjour, la station Buttes Chaumont est à 4 minutes à pied.' },
      { from: 'me', ago: 9 * DAY - 3 * HOUR, read: true, body: 'Très bien, je vous confirme mes dates dans la semaine.' },
    ],
  },
];

const OWNER_CONVERSATIONS = [
  {
    host: 'Hugo Perrier',
    property: 'b4c67936',
    messages: [
      { from: 'me', ago: DAY + 2 * HOUR, read: true, body: 'Bonjour Hugo, pouvez-vous me dire comment vous fixez le prix de votre studio ?' },
      { from: 'them', ago: DAY, read: false, body: 'Bonjour, je regarde les tarifs du quartier et je les ajuste selon la saison.' },
      { from: 'them', ago: DAY - 10 * MIN, read: false, body: 'Je peux aussi vous partager mon calendrier de réservations si cela vous aide.' },
    ],
  },
  {
    host: 'Michel Romy',
    property: '6ff132c6',
    messages: [
      { from: 'them', ago: 35 * MIN, read: false, body: "Bonjour, j'ai vu votre annonce, comment gérez-vous les arrivées tardives ?" },
    ],
  },
  {
    host: 'Sarah Devit',
    property: '5323c29b',
    messages: [
      { from: 'me', ago: 3 * DAY, read: true, body: 'Bonjour Sarah, utilisez-vous une société de ménage pour les départs ?' },
      { from: 'them', ago: 3 * DAY - HOUR, read: true, body: 'Oui, une société locale, 35 € par passage. Je peux vous donner leurs coordonnées.' },
    ],
  },
  {
    host: 'Victor Moran',
    property: '2cf259e1',
    messages: [
      { from: 'me', ago: 5 * DAY, read: true, body: 'Bonjour Victor, votre studio du Marais est très bien noté, quel est votre secret ?' },
      { from: 'them', ago: 5 * DAY - 4 * HOUR, read: true, body: 'Merci ! Un accueil soigné et un petit guide du quartier laissé sur place.' },
      { from: 'me', ago: 5 * DAY - 5 * HOUR, read: true, body: "Excellente idée, je m'en inspire." },
    ],
  },
  {
    host: 'Line Rolland',
    property: 'f72a452f',
    messages: [
      { from: 'me', ago: 8 * DAY, read: true, body: "Bonjour Line, j'ai vu votre studio d'artiste, il est superbe." },
      { from: 'them', ago: 8 * DAY - 2 * HOUR, read: true, body: 'Merci beaucoup ! Vous avez un logement à louer vous aussi ?' },
      { from: 'me', ago: 8 * DAY - 3 * HOUR, read: true, body: "Oui, je viens de le mettre en ligne et je cherche des conseils pour les photos." },
      { from: 'them', ago: 7 * DAY, read: true, body: 'Prenez-les en lumière du jour, et ajoutez une photo de chaque pièce.' },
    ],
  },
];

/** `YYYY-MM-DD HH:MM:SS` in UTC, the shape SQLite's CURRENT_TIMESTAMP writes. */
function sqlTime(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60000).toISOString().slice(0, 19).replace('T', ' ');
}

/** read_at lands a few minutes after the message, never in the future. */
function readAtFor(minutesAgo) {
  return sqlTime(Math.max(minutesAgo - 7, 0));
}

async function findAccount(db, emails) {
  for (const email of emails) {
    const user = await db.getAsync('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (user) return user;
  }
  throw new Error(`No account found for ${emails.join(' / ')} — aborting, nothing changed.`);
}

async function removeOtherAccounts(db, keepIds) {
  const placeholders = keepIds.map(() => '?').join(',');
  const others = await db.allAsync(
    `SELECT id, email FROM users WHERE email IS NOT NULL AND id NOT IN (${placeholders})`,
    keepIds
  );

  for (const user of others) {
    // properties.host_id is RESTRICT: a host's properties go before the host.
    const props = await db.runAsync('DELETE FROM properties WHERE host_id = ?', [user.id]);
    await db.runAsync('DELETE FROM users WHERE id = ?', [user.id]);
    console.log(`Deleted ${user.email} (and ${props.changes} propert${props.changes === 1 ? 'y' : 'ies'}).`);
  }
  if (!others.length) console.log('No other account to delete.');
}

async function insertConversations(db, account, conversations) {
  for (const conversation of conversations) {
    const host = await db.getAsync('SELECT id FROM users WHERE name = ?', [conversation.host]);
    if (!host) throw new Error(`Unknown host "${conversation.host}" — aborting, nothing changed.`);

    if (conversation.property) {
      const property = await db.getAsync('SELECT id FROM properties WHERE id = ?', [conversation.property]);
      if (!property) throw new Error(`Unknown property "${conversation.property}" — aborting, nothing changed.`);
    }

    for (const message of conversation.messages) {
      const fromMe = message.from === 'me';
      await db.runAsync(
        'INSERT INTO messages(sender_id, recipient_id, property_id, body, created_at, read_at) VALUES (?,?,?,?,?,?)',
        [
          fromMe ? account.id : host.id,
          fromMe ? host.id : account.id,
          conversation.property,
          message.body,
          sqlTime(message.ago),
          message.read ? readAtFor(message.ago) : null,
        ]
      );
    }
  }
}

async function printInbox(db, account) {
  console.log(`\nInbox of ${account.email} (as GET /api/messages returns it):`);
  for (const thread of await listThreads(db, account.id)) {
    const unread = thread.unread_count > 0 ? `${thread.unread_count} unread` : 'read';
    console.log(`  ${thread.user.name.padEnd(20)}${unread.padEnd(10)}${thread.last_message.body.slice(0, 50)}`);
  }
}

async function main() {
  const db = await initialize();
  await db.execAsync('PRAGMA foreign_keys = ON');

  const client = await findAccount(db, CLIENT_EMAILS);
  const owner = await findAccount(db, OWNER_EMAILS);

  await db.execAsync('BEGIN');
  try {
    await removeOtherAccounts(db, [client.id, owner.id]);

    const cleared = await db.runAsync('DELETE FROM messages');
    console.log(`Deleted ${cleared.changes} message(s).`);

    await insertConversations(db, client, CLIENT_CONVERSATIONS);
    await insertConversations(db, owner, OWNER_CONVERSATIONS);

    await printInbox(db, client);
    await printInbox(db, owner);

    await db.execAsync(DRY_RUN ? 'ROLLBACK' : 'COMMIT');
    console.log(DRY_RUN ? '\nDry run: nothing was changed.' : '\nDone.');
  } catch (err) {
    await db.execAsync('ROLLBACK');
    throw err;
  } finally {
    db.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
