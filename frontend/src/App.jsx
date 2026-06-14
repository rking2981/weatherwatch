import React, { useState, useEffect } from 'react';
import WeatherMap from './components/WeatherMap';
import AlertSidebar from './components/AlertSidebar';
import LocationWatchlist from './components/LocationWatchlist';
import NewsTicker from './components/NewsTicker';
import AlertPopup from './components/AlertPopup';
import ThreatBanner from './components/ThreatBanner';
import WeatherRadio from './components/WeatherRadio';
import { useAlerts } from './services/useAlerts';
import { useRadio } from './services/useRadio';
import { stationForAlert } from './services/radioStations';
import { subscribeToPush } from './services/pushClient';
import './App.css';

export default function App() {
  const { alerts, newAlerts, topAlert, latestAlert, loading } = useAlerts();
  const radio = useRadio(topAlert);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [panel, setPanel] = useState(null); // null | 'alerts' | 'locations'
  const [popupAlerts, setPopupAlerts] = useState([]);

  useEffect(() => { subscribeToPush(); }, []);

  // Queue new alerts for the popup
  useEffect(() => {
    if (newAlerts.length > 0) setPopupAlerts(newAlerts);
  }, [newAlerts]);

  return (
    <div className="app">
      <WeatherMap alerts={alerts} selectedAlert={selectedAlert} topAlert={topAlert} pulseAlertId={popupAlerts[0]?.id || null} onAlertClick={setSelectedAlert} />

      {/* Threat summary banner — top of map, shows latest alert */}
      <ThreatBanner topAlert={latestAlert} />

      {/* Floating top-left controls */}
      <div className="overlay-controls">
        <button
          className={`overlay-btn ${panel === 'alerts' ? 'active' : ''}`}
          onClick={() => setPanel(p => p === 'alerts' ? null : 'alerts')}
        >
          ⚠ Alerts {alerts.length > 0 && <span className="badge">{alerts.length}</span>}
        </button>
        <button
          className={`overlay-btn ${panel === 'locations' ? 'active' : ''}`}
          onClick={() => setPanel(p => p === 'locations' ? null : 'locations')}
        >
          📍 Watchlist
        </button>
        <button
          className={`overlay-btn ${panel === 'radio' ? 'active' : ''}`}
          onClick={() => setPanel(p => p === 'radio' ? null : 'radio')}
        >
          📻 Weather Radio
        </button>
      </div>

      {/* Sliding panel */}
      {panel && (
        <div className="overlay-panel">
          <div className="overlay-panel-header">
            <span>{panel === 'alerts' ? '⚠ Active Alerts' : panel === 'locations' ? '📍 Watchlist' : '📻 Weather Radio'}</span>
            <button className="panel-close" onClick={() => setPanel(null)}>✕</button>
          </div>
          {panel === 'alerts'
            ? <AlertSidebar alerts={alerts} loading={loading} onSelect={a => { setSelectedAlert(a); setPanel(null); }} selected={selectedAlert} />
            : panel === 'locations'
            ? <LocationWatchlist />
            : <WeatherRadio {...radio} />
          }
        </div>
      )}

      {/* News ticker at bottom */}
      <NewsTicker alerts={alerts} latestAlert={latestAlert} onSelect={setSelectedAlert} />

      {/* New alert popup */}
      {popupAlerts.length > 0 && (
        <AlertPopup
          alerts={popupAlerts}
          onDismiss={() => setPopupAlerts([])}
          onZoom={a => setSelectedAlert(a)}
          onTuneRadio={a => {
            const s = stationForAlert(a);
            if (s) { radio.tuneToStation(s); setPanel('radio'); }
          }}
        />
      )}
    </div>
  );
}
