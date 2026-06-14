import React, { useState } from 'react';
import { STATIONS } from '../services/radioStations';
import { NPR_STATIONS } from '../services/newsStations';
import './WeatherRadio.css';

export default function WeatherRadio({ station, playing, muted, volume, loading, autoTuned, tuneToStation, togglePlay, setMuted, setVolume }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('weather'); // 'weather' | 'npr'

  // ── Weather Radio tab ──────────────────────────────
  const filteredWeather = search
    ? STATIONS.filter(s =>
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.state.toLowerCase().includes(search.toLowerCase()) ||
        s.callsign.toLowerCase().includes(search.toLowerCase())
      )
    : STATIONS;

  const weatherByState = filteredWeather.reduce((acc, s) => {
    if (!acc[s.state]) acc[s.state] = [];
    acc[s.state].push(s);
    return acc;
  }, {});

  // ── NPR tab ────────────────────────────────────────
  const filteredNpr = search
    ? NPR_STATIONS.filter(s =>
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.state.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    : NPR_STATIONS;

  const nprByState = filteredNpr.reduce((acc, s) => {
    if (!acc[s.state]) acc[s.state] = [];
    acc[s.state].push(s);
    return acc;
  }, {});

  // Display name for player bar (weather stations use callsign, NPR use name)
  const isNprStation = station && !station.callsign;

  return (
    <div className="weather-radio">
      {/* Player bar */}
      <div className="radio-player">
        <div className="radio-player-left">
          <div className="radio-icon">{isNprStation ? '📡' : '📻'}</div>
          <div className="radio-info">
            {station
              ? <>
                  <span className="radio-callsign">{station.callsign || station.name}</span>
                  <span className="radio-location">{station.city}, {station.state}</span>
                  {autoTuned && <span className="radio-autotuned">AUTO-TUNED</span>}
                </>
              : <span className="radio-idle">Select a station below</span>
            }
          </div>
        </div>

        <div className="radio-player-controls">
          {loading && playing && <span className="radio-loading">⏳</span>}
          <button
            className={`radio-play-btn ${playing ? 'playing' : ''}`}
            onClick={togglePlay}
            disabled={!station}
          >
            {playing ? '⏹' : '▶'}
          </button>
          <button
            className={`radio-mute-btn ${muted ? 'muted' : ''}`}
            onClick={() => setMuted(m => !m)}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          <input
            type="range" min="0" max="1" step="0.05"
            value={volume}
            onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
            className="radio-volume"
          />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="radio-tabs">
        <button
          className={`radio-tab ${tab === 'weather' ? 'active' : ''}`}
          onClick={() => { setTab('weather'); setSearch(''); }}
        >
          WEATHER RADIO
        </button>
        <button
          className={`radio-tab ${tab === 'npr' ? 'active' : ''}`}
          onClick={() => { setTab('npr'); setSearch(''); }}
        >
          NPR NEWS
        </button>
      </div>

      {/* Station browser */}
      <div className="radio-station-browser">
        <input
          className="radio-search"
          type="text"
          placeholder={tab === 'weather' ? 'Search by state, city, or callsign…' : 'Search by state, city, or name…'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="radio-station-list">
          {tab === 'weather' ? (
            <>
              {Object.entries(weatherByState).sort(([a], [b]) => a.localeCompare(b)).map(([state, stations]) => (
                <div key={state} className="radio-state-group">
                  <div className="radio-state-label">{state}</div>
                  {stations.map(s => (
                    <button
                      key={s.callsign}
                      className={`radio-station-btn ${station?.callsign === s.callsign ? 'active' : ''}`}
                      onClick={() => tuneToStation(s)}
                    >
                      <span className="station-callsign">{s.callsign}</span>
                      <span className="station-city">{s.city}</span>
                      {station?.callsign === s.callsign && playing && (
                        <span className="station-live">ON AIR</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
              {Object.keys(weatherByState).length === 0 && (
                <div className="radio-no-results">No stations match "{search}"</div>
              )}
            </>
          ) : (
            <>
              {Object.entries(nprByState).sort(([a], [b]) => a.localeCompare(b)).map(([state, stations]) => (
                <div key={state} className="radio-state-group">
                  <div className="radio-state-label">{state}</div>
                  {stations.map(s => (
                    <button
                      key={s.url}
                      className={`radio-station-btn ${station?.url === s.url ? 'active' : ''}`}
                      onClick={() => tuneToStation(s)}
                    >
                      <span className="station-callsign">{s.name}</span>
                      <span className="station-city">{s.city}</span>
                      {station?.url === s.url && playing && (
                        <span className="station-live">ON AIR</span>
                      )}
                    </button>
                  ))}
                </div>
              ))}
              {Object.keys(nprByState).length === 0 && (
                <div className="radio-no-results">No stations match "{search}"</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
