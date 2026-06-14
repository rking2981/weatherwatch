import React from 'react';
import './Header.css';

export default function Header({ alertCount }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-icon">⛈</span>
        <span className="header-title">WeatherWather</span>
      </div>
      <div className="header-status">
        {alertCount > 0
          ? <span className="status-alert">⚠ {alertCount} Active Alert{alertCount !== 1 ? 's' : ''}</span>
          : <span className="status-clear">✓ No Active Alerts</span>
        }
      </div>
    </header>
  );
}
