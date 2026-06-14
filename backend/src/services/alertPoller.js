const fetch = require('node-fetch');
const store = require('./store');

const NOAA_ALERTS_URL = 'https://api.weather.gov/alerts/active?status=actual';

const SEVERE_EVENT_TYPES = new Set([
  'Tornado Warning',
  'Tornado Watch',
  'Severe Thunderstorm Warning',
  'Severe Thunderstorm Watch',
  'Flash Flood Warning',
  'Flash Flood Watch',
  'Hurricane Warning',
  'Hurricane Watch',
  'Tropical Storm Warning',
  'Blizzard Warning',
  'Ice Storm Warning',
  'Winter Storm Warning',
  'Extreme Wind Warning',
  'Dust Storm Warning',
  'Tsunami Warning',
  'Earthquake Warning',
]);

async function poll(pushService) {
  try {
    const res = await fetch(NOAA_ALERTS_URL, {
      headers: { 'User-Agent': 'WeatherWather/1.0 (ryan.king3481@gmail.com)' },
    });

    if (!res.ok) {
      console.error(`[poller] NOAA returned ${res.status}`);
      return;
    }

    const data = await res.json();
    const features = data.features || [];
    const now = Date.now();

    const activeIds = new Set();
    const newAlerts = [];

    for (const feature of features) {
      const id = feature.id;
      activeIds.add(id);

      if (!store.hasAlert(id)) {
        store.addAlert(id, feature);
        const event = feature.properties?.event || '';
        if (SEVERE_EVENT_TYPES.has(event)) {
          newAlerts.push(feature);
        }
      }
    }

    // Expire alerts no longer in feed
    store.pruneAlerts(activeIds);

    if (newAlerts.length > 0) {
      console.log(`[poller] ${newAlerts.length} new severe alert(s) — pushing notifications`);
      await pushService.notifyWatchedLocations(newAlerts);
    }

    console.log(`[poller] Done. ${store.alertCount()} active alerts tracked.`);
  } catch (err) {
    console.error('[poller] Error:', err.message);
  }
}

module.exports = { poll };
