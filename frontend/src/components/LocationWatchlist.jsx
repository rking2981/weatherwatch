import React, { useState, useEffect } from 'react';
import './LocationWatchlist.css';

export default function LocationWatchlist() {
  const [locations, setLocations] = useState([]);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/locations')
      .then(r => r.json())
      .then(setLocations)
      .catch(() => {});
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!name || !lat || !lon) { setError('All fields required'); return; }
    setAdding(true);
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, lat: parseFloat(lat), lon: parseFloat(lon) }),
      });
      if (!res.ok) throw new Error('Failed');
      const loc = await res.json();
      setLocations(prev => [...prev, loc]);
      setName(''); setLat(''); setLon('');
    } catch {
      setError('Could not add location. Is the backend running?');
    } finally {
      setAdding(false);
    }
  }

  async function handleGeolocate() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      setLat(pos.coords.latitude.toFixed(4));
      setLon(pos.coords.longitude.toFixed(4));
    });
  }

  async function handleRemove(id) {
    await fetch(`/api/locations/${id}`, { method: 'DELETE' });
    setLocations(prev => prev.filter(l => l.id !== id));
  }

  return (
    <div className="watchlist">
      <form className="watchlist-form" onSubmit={handleAdd}>
        <h3>Add Location</h3>
        <input placeholder="Name (e.g. Home)" value={name} onChange={e => setName(e.target.value)} />
        <div className="coord-row">
          <input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} />
          <input placeholder="Longitude" value={lon} onChange={e => setLon(e.target.value)} />
          <button type="button" className="btn-geo" onClick={handleGeolocate} title="Use my location">📍</button>
        </div>
        {error && <div className="wl-error">{error}</div>}
        <button type="submit" className="btn-add" disabled={adding}>
          {adding ? 'Adding...' : 'Add to Watchlist'}
        </button>
      </form>

      <div className="watchlist-list">
        {locations.length === 0 && (
          <div className="wl-empty">No locations watched yet. Add one above to receive targeted alerts.</div>
        )}
        {locations.map(loc => (
          <div key={loc.id} className="wl-item">
            <div className="wl-item-info">
              <span className="wl-name">{loc.name}</span>
              <span className="wl-coords">{loc.lat.toFixed(3)}, {loc.lon.toFixed(3)}</span>
            </div>
            <button className="btn-remove" onClick={() => handleRemove(loc.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
