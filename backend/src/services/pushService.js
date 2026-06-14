const webpush = require('web-push');
const store = require('./store');

// Generate VAPID keys once with: npx web-push generate-vapid-keys
// Then set these env vars or paste the keys below for dev
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:ryan.king3481@gmail.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

function alertIntersectsLocation(feature, location) {
  const coords = feature.geometry?.coordinates;
  const type = feature.geometry?.type;
  if (!coords || !type) return false;

  // Rough bounding-box check — good enough for notification gating
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;

  const flatCoords = type === 'Polygon' ? coords[0]
    : type === 'MultiPolygon' ? coords.flatMap(p => p[0])
    : null;

  if (!flatCoords) return false;

  for (const [lon, lat] of flatCoords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  return (
    location.lat >= minLat && location.lat <= maxLat &&
    location.lon >= minLon && location.lon <= maxLon
  );
}

async function notifyWatchedLocations(newAlerts) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[push] VAPID keys not set — skipping push notifications');
    return;
  }

  const subs = store.getSubscriptions();
  const locations = store.getLocations();

  for (const alert of newAlerts) {
    const props = alert.properties || {};
    const matchedLocations = locations.filter(loc => alertIntersectsLocation(alert, loc));

    if (matchedLocations.length === 0) continue;

    const locationNames = matchedLocations.map(l => l.name).join(', ');
    const payload = JSON.stringify({
      title: props.event || 'Severe Weather Alert',
      body: `${props.headline || props.description?.slice(0, 120) || ''} — Affects: ${locationNames}`,
      severity: props.severity,
      alertId: alert.id,
    });

    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 410) {
          // Subscription expired — remove it
          store.removeSubscription(sub);
        } else {
          console.error('[push] Send error:', err.message);
        }
      }
    }
  }
}

module.exports = { notifyWatchedLocations, VAPID_PUBLIC_KEY };
