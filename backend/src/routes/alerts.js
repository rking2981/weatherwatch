const express = require('express');
const store = require('../services/store');

const router = express.Router();

// GET /api/alerts — return all active alerts as GeoJSON FeatureCollection
router.get('/', (req, res) => {
  res.json({
    type: 'FeatureCollection',
    features: store.getAlerts(),
  });
});

module.exports = router;
