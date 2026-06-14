import React, { useState } from 'react';
import './AlertSidebar.css';

const SEVERITY_ORDER = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };

function severityClass(sev) {
  return (sev || 'unknown').toLowerCase();
}

export default function AlertSidebar({ alerts, loading, onSelect, selected }) {
  const [filter, setFilter] = useState('');

  const sorted = [...alerts].sort((a, b) => {
    const sa = SEVERITY_ORDER[a.properties?.severity] ?? 4;
    const sb = SEVERITY_ORDER[b.properties?.severity] ?? 4;
    return sa - sb;
  });

  const filtered = filter
    ? sorted.filter(a =>
        (a.properties?.event || '').toLowerCase().includes(filter.toLowerCase()) ||
        (a.properties?.areaDesc || '').toLowerCase().includes(filter.toLowerCase())
      )
    : sorted;

  return (
    <div className="alert-sidebar">
      <div className="alert-search">
        <input
          type="text"
          placeholder="Search alerts..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>
      <div className="alert-list">
        {loading && <div className="alert-empty">Loading alerts...</div>}
        {!loading && filtered.length === 0 && (
          <div className="alert-empty">No active alerts{filter ? ' matching filter' : ''}.</div>
        )}
        {filtered.map(alert => {
          const p = alert.properties || {};
          const isSelected = selected?.id === alert.id;
          return (
            <div
              key={alert.id}
              className={`alert-card severity-${severityClass(p.severity)} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(isSelected ? null : alert)}
            >
              <div className="alert-card-header">
                <span className="alert-event">{p.event || 'Unknown Event'}</span>
                <span className={`alert-severity severity-badge-${severityClass(p.severity)}`}>
                  {p.severity || 'Unknown'}
                </span>
              </div>
              <div className="alert-area">{p.areaDesc || ''}</div>
              {isSelected && (
                <div className="alert-detail">
                  <p className="alert-headline">{p.headline}</p>
                  {p.instruction && <p className="alert-instruction"><strong>Action:</strong> {p.instruction}</p>}
                  <p className="alert-meta">
                    Effective: {p.effective ? new Date(p.effective).toLocaleString() : 'N/A'}<br />
                    Expires: {p.expires ? new Date(p.expires).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
