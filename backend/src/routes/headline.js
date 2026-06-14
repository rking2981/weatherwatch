const express = require('express');
const headlinePoller = require('../services/headlinePoller');

const router = express.Router();

router.get('/', (req, res) => {
  const headline = headlinePoller.getHeadline();
  res.json({ headline });
});

module.exports = router;
