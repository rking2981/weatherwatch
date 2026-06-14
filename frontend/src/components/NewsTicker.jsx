import React, { useEffect, useRef, useState } from 'react';
import { buildThreatSummary, DAMAGE_KEYWORDS } from './ThreatBanner';
import { getSafetyActions } from '../services/safetyActions';
import './NewsTicker.css';

const SEVERITY_ORDER = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };

const SEVERITY_COLOR = {
  Extreme:  '#7f0000',
  Severe:   '#b71c1c',
  Moderate: '#e65100',
  Minor:    '#f57f17',
  Unknown:  '#263238',
};

function buildHeadline(alert) {
  if (!alert) return null;
  const p = alert.properties || {};
  const desc = (p.description || '').toUpperCase();
  const event = (p.event || '').toUpperCase();
  const area = p.areaDesc || '';
  const states = [...new Set((area.match(/\b([A-Z]{2})\b/g) || []))].slice(0, 3);
  const stateSuffix = states.length > 0 ? ' IN ' + states.join(' & ') : '';
  const damage = DAMAGE_KEYWORDS.find(k => k.pattern.test(desc))?.label || null;
  return (damage ? `${damage} ${event}` : event) + stateSuffix;
}

function buildCounties(alert) {
  if (!alert) return null;
  return (alert.properties?.areaDesc || '')
    .split(/[;,]/)
    .map(s => s.replace(/\(.*?\)/g, '').trim().toUpperCase())
    .filter(Boolean)
    .slice(0, 6)
    .join(' · ');
}

function sortedAlerts(alerts) {
  return [...alerts].sort((a, b) =>
    (SEVERITY_ORDER[a.properties?.severity] ?? 4) - (SEVERITY_ORDER[b.properties?.severity] ?? 4)
  );
}

function expiresIn(expiresStr) {
  if (!expiresStr) return null;
  const diff = new Date(expiresStr) - Date.now();
  if (diff <= 0) return 'EXPIRED';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `EXPIRES IN ${mins}M`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return `EXPIRES IN ${hrs}H ${rem}M`;
}

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function NewsTicker({ alerts, latestAlert, onSelect }) {
  const sorted = sortedAlerts(alerts);
  // Center block shows latest alert; right block severity driven by it
  const featured = latestAlert || sorted[0] || null;
  const tickerTextRef = useRef(null);
  const [animDuration, setAnimDuration] = useState(40);
  const clock = useClock();

  useEffect(() => {
    if (tickerTextRef.current) {
      const width = tickerTextRef.current.scrollWidth;
      setAnimDuration(Math.max(20, width / 90));
    }
  }, [featured?.id, featured?.properties?.event]);

  const sev = featured?.properties?.severity || 'Unknown';
  const bgColor = SEVERITY_COLOR[sev] || SEVERITY_COLOR.Unknown;
  const expires = expiresIn(featured?.properties?.expires);
  const headline = buildHeadline(featured);
  const counties = buildCounties(featured);

  const timeStr = clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = clock.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  const tzStr = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Bottom ticker: NWS instruction text if present, else generic safety steps, else all-clear
  const safety = featured
    ? getSafetyActions(featured.properties?.event, sev)
    : null;

  const nwsInstruction = featured?.properties?.instruction?.replace(/\s+/g, ' ').trim() || null;

  const tickerItems = !featured
    ? [<span key="clear">All clear — no active NWS weather alerts at this time.</span>]
    : nwsInstruction
    ? [
        <span key="label" className="ticker-safety-label" style={{ color: bgColor }}>
          {safety ? `${safety.icon}  ${safety.heading}` : '⚠  TAKE ACTION'}
        </span>,
        <span key="text" className="ticker-safety-step"> {nwsInstruction}</span>,
      ]
    : safety
    ? safety.steps.flatMap((step, i) => [
        <span key={`label-${i}`} className="ticker-safety-label" style={{ color: bgColor }}>
          {i === 0 ? `${safety.icon}  ${safety.heading}` : `${i + 1}.`}
        </span>,
        <span key={`step-${i}`} className="ticker-safety-step"> {step}</span>,
        <span key={`sep-${i}`} className="ticker-sep">{'     ◆     '}</span>,
      ])
    : [
        <span key="event" className="ticker-alert-name" style={{ color: bgColor }}>
          {featured.properties?.event?.toUpperCase()}
        </span>,
        <span key="area" className="ticker-alert-area">
          {' — '}{featured.properties?.areaDesc}
        </span>,
      ];

  return (
    <div className="news-ticker" style={{ '--ticker-bg': bgColor }}>

      {/* ── Top row: clock | TOP ALERT label + summary | expires ── */}
      <div className="ticker-top-row">

        {/* Left: live clock */}
        <div className="ticker-clock">
          <span className="ticker-time">{timeStr}</span>
          <span className="ticker-date">{dateStr}</span>
          <span className="ticker-tz">{tzStr}</span>
        </div>

        {/* Center: headline + county subtitle */}
        <div
          className="ticker-alert-block"
          onClick={() => featured && onSelect(featured)}
          style={{ cursor: featured ? 'pointer' : 'default' }}
        >
          {featured
            ? <div className="ticker-headline-stack">
                <span className="ticker-summary">
                  <span className="ticker-top-label" style={{ background: bgColor }}>TOP ALERT: </span>
                  {headline}
                </span>
                {counties && <span className="ticker-counties">{counties}</span>}
              </div>
            : <span className="ticker-summary ticker-clear">NO ACTIVE WEATHER ALERTS</span>
          }
        </div>

        {/* Right: event type + expires */}
        {featured && (
          <div className="ticker-right-block" style={{ borderColor: bgColor }}>
            <span className="ticker-event-name" style={{ color: bgColor }}>
              {featured.properties?.event?.toUpperCase()}
            </span>
            {expires && <span className="ticker-expires">{expires}</span>}
          </div>
        )}
      </div>

      {/* ── Bottom row: safety actions ticker ── */}
      <div className="ticker-bottom-row">
        <div className="ticker-bottom-label" style={{ background: bgColor }}>
          {safety ? 'WHAT TO DO' : 'LIVE ALERTS'}
        </div>
        <div className="ticker-track">
          <span
            ref={tickerTextRef}
            className="ticker-text"
            style={{ animationDuration: `${animDuration}s` }}
          >
            {tickerItems}
          </span>
        </div>
      </div>

    </div>
  );
}
