const express = require('express');
const store = require('../services/store');

const router = express.Router();

// GET /api/locations
router.get('/', (req, res) => {
  res.json(store.getLocations());
});

// POST /api/locations  body: { name, lat, lon }
router.post('/', (req, res) => {
  const { name, lat, lon } = req.body;
  if (!name || lat == null || lon == null) {
    return res.status(400).json({ error: 'name, lat, and lon are required' });
  }
  const id = store.addLocation(name, parseFloat(lat), parseFloat(lon));
  res.status(201).json({ id, name, lat: parseFloat(lat), lon: parseFloat(lon) });
});

// DELETE /api/locations/:id
router.delete('/:id', (req, res) => {
  store.removeLocation(req.params.id);
  res.status(204).end();
});

module.exports = router;
