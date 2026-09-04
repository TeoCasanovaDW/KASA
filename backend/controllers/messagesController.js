const messages = require('../services/messagesService');

function statusFromError(e) {
  if (e && e.status) return e.status;
  return 500;
}

async function listThreads(req, res) {
  const db = req.app.locals.db;
  try {
    const list = await messages.listThreads(db, req.user.id);
    res.json(list);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getThread(req, res) {
  const db = req.app.locals.db;
  try {
    const thread = await messages.getThread(db, req.user.id, req.params.userId);
    res.json(thread);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function send(req, res) {
  const db = req.app.locals.db;
  try {
    const body = req.body || {};
    const created = await messages.sendMessage(db, req.user.id, {
      recipientId: body.recipient_id,
      body: body.body,
      propertyId: body.property_id,
    });
    res.status(201).json(created);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function markRead(req, res) {
  const db = req.app.locals.db;
  try {
    const result = await messages.markThreadRead(db, req.user.id, req.params.userId);
    res.status(200).json(result);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = { listThreads, getThread, send, markRead };
