const express = require('express');
const store = require('../services/store');
const { VAPID_PUBLIC_KEY } = require('../services/pushService');

const router = express.Router();

// GET /api/push/vapid-public-key
router.get('/vapid-public-key', (req, res) => {
  res.json({ key: VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe  body: PushSubscription object
router.post('/subscribe', (req, res) => {
  const sub = req.body;
  if (!sub?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });
  store.addSubscription(sub);
  res.status(201).json({ ok: true });
});

// POST /api/push/unsubscribe
router.post('/unsubscribe', (req, res) => {
  store.removeSubscription(req.body);
  res.status(200).json({ ok: true });
});

module.exports = router;
