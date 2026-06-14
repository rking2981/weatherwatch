import { useState, useEffect, useRef } from 'react';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [newAlerts, setNewAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const seenIds = useRef(new Set());
  const isFirst = useRef(true);

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts');
      if (!res.ok) return;
      const data = await res.json();
      const features = data.features || [];

      if (isFirst.current) {
        // Seed seen IDs on first load — don't pop up stale alerts
        features.forEach(f => seenIds.current.add(f.id));
        isFirst.current = false;
      } else {
        const fresh = features.filter(f => !seenIds.current.has(f.id));
        fresh.forEach(f => seenIds.current.add(f.id));
        if (fresh.length > 0) setNewAlerts(fresh);
      }

      setAlerts(features);
    } catch {
      // Backend not reachable — silently retry next interval
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 30_000);
    return () => clearInterval(id);
  }, []);

  const SEVERITY_ORDER = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
  const topAlert = alerts.length
    ? [...alerts].sort((a, b) =>
        (SEVERITY_ORDER[a.properties?.severity] ?? 4) - (SEVERITY_ORDER[b.properties?.severity] ?? 4)
      )[0]
    : null;

  // Most recently issued alert among the highest-severity tier
  // (if a new Minor alert arrives while a Tornado Warning is active, keep showing the tornado)
  const topSeverity = topAlert?.properties?.severity;
  const SEVERITY_ORDER_MAP = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
  const topTierAlerts = topAlert
    ? alerts.filter(a => (SEVERITY_ORDER_MAP[a.properties?.severity] ?? 4) <= (SEVERITY_ORDER_MAP[topSeverity] ?? 4))
    : [];
  const latestAlert = topTierAlerts.length
    ? [...topTierAlerts].sort((a, b) =>
        new Date(b.properties?.sent || 0) - new Date(a.properties?.sent || 0)
      )[0]
    : topAlert;

  return { alerts, newAlerts, topAlert, latestAlert, loading };
}
