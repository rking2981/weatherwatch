import React, { useEffect, useState } from 'react';
import './RadarLegend.css';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export default function RadarLegend({ refreshedAt }) {
  const now = useClock();

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  // Extract numeric time and AM/PM + timezone separately for styling
  const [timePart, meridiem] = timeStr.split(' ');
  const tz = Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
    .formatToParts(now)
    .find(p => p.type === 'timeZoneName')?.value || '';

  const minsAgo = refreshedAt
    ? Math.round((now - refreshedAt) / 60000)
    : null;

  return (
    <div className="radar-legend">
      {/* Top row: title + clock */}
      <div className="radar-legend-header">
        <span className="radar-legend-title">LOCAL RADAR</span>
        <span className="radar-legend-clock">
          <span className="radar-clock-time">{timePart}</span>
          <span className="radar-clock-ampm"> {meridiem} {tz}</span>
        </span>
      </div>

      {/* Divider line accent */}
      <div className="radar-legend-divider" />

      {/* Color scale */}
      <div className="radar-scale-bar" />
      <div className="radar-scale-labels">
        <span>LIGHT</span>
        <span>MODERATE</span>
        <span>HEAVY</span>
        <span>EXTREME</span>
      </div>

      {/* Footer: station info + region */}
      <div className="radar-legend-footer">
        <span className="radar-station">NEXRAD{minsAgo !== null ? ` • ${minsAgo === 0 ? 'LIVE' : `${minsAgo}m AGO`}` : ''}</span>
        <span className="radar-region">NWS ▷</span>
      </div>
    </div>
  );
}
