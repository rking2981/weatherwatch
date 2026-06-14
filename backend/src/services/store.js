// In-memory store for active alerts, locations, and push subscriptions.
// Data is lost on restart — acceptable for a polling-based alert system
// since NOAA is the source of truth and we re-fetch on startup.

const alerts = new Map();       // id -> GeoJSON feature
const locations = new Map();    // id -> { id, name, lat, lon }
const subscriptions = new Set(); // serialized push subscription objects

let nextLocationId = 1;

// Alerts
function hasAlert(id) { return alerts.has(id); }
function addAlert(id, feature) { alerts.set(id, feature); }
function getAlerts() { return [...alerts.values()]; }
function alertCount() { return alerts.size; }
function pruneAlerts(activeIds) {
  for (const id of alerts.keys()) {
    if (!activeIds.has(id)) alerts.delete(id);
  }
}

// Locations
function addLocation(name, lat, lon) {
  const id = String(nextLocationId++);
  locations.set(id, { id, name, lat, lon });
  return id;
}
function removeLocation(id) { locations.delete(id); }
function getLocations() { return [...locations.values()]; }

// Push subscriptions
function addSubscription(sub) { subscriptions.add(JSON.stringify(sub)); }
function removeSubscription(sub) { subscriptions.delete(JSON.stringify(sub)); }
function getSubscriptions() { return [...subscriptions].map(s => JSON.parse(s)); }

module.exports = {
  hasAlert, addAlert, getAlerts, alertCount, pruneAlerts,
  addLocation, removeLocation, getLocations,
  addSubscription, removeSubscription, getSubscriptions,
};
