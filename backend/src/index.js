require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const alertPoller = require('./services/alertPoller');
const headlinePoller = require('./services/headlinePoller');
const pushService = require('./services/pushService');
const alertsRouter = require('./routes/alerts');
const locationsRouter = require('./routes/locations');
const pushRouter = require('./routes/push');
const headlineRouter = require('./routes/headline');

const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

app.use('/api/alerts', alertsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/push', pushRouter);
app.use('/api/headline', headlineRouter);

// In production, serve the built React frontend
if (IS_PROD) {
  const frontendDist = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const ALERT_POLL_MS = 30_000; // 30 seconds

app.listen(PORT, () => {
  console.log(`WeatherWather backend running on http://localhost:${PORT}`);
  // Initial poll on startup, then every 30 seconds
  alertPoller.poll(pushService).then(() => headlinePoller.poll());
  setInterval(async () => {
    console.log('[poll] Polling NOAA for alerts...');
    await alertPoller.poll(pushService);
    await headlinePoller.poll();
  }, ALERT_POLL_MS);
});
