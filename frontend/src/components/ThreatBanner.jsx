import React, { useEffect, useState, useRef } from 'react';
import './ThreatBanner.css';

const SEVERITY_COLOR = {
  Extreme:  '#7f0000',
  Severe:   '#b71c1c',
  Moderate: '#e65100',
  Minor:    '#f57f17',
  Unknown:  '#263238',
};

export const DAMAGE_KEYWORDS = [
  { pattern: /PARTICULARLY DANGEROUS SITUATION/i, label: 'PARTICULARLY DANGEROUS SITUATION' },
  { pattern: /CATASTROPHIC/i,                      label: 'CATASTROPHIC DAMAGE THREAT' },
  { pattern: /CONSIDERABLE\s+DAMAGE/i,             label: 'CONSIDERABLE DAMAGE THREAT' },
  { pattern: /DESTRUCTIVE/i,                       label: 'DESTRUCTIVE WINDS' },
  { pattern: /LIFE[- ]THREATENING/i,               label: 'LIFE-THREATENING SITUATION' },
  { pattern: /TORNADO\s+EMERGENCY/i,               label: 'TORNADO EMERGENCY' },
  { pattern: /SIGNIFICANT\s+DAMAGE/i,              label: 'SIGNIFICANT DAMAGE THREAT' },
  { pattern: /DAMAGING\s+WIND/i,                   label: 'DAMAGING WINDS' },
  { pattern: /FLASH\s+FLOOD\s+EMERGENCY/i,         label: 'FLASH FLOOD EMERGENCY' },
];

function parseWind(text) {
  const m = text.match(/(?:WIND[S]?\s+(?:GUSTS?\s+(?:UP\s+TO\s+)?)?|GUSTS?\s+(?:TO\s+)?)(\d+)\s*MPH/i)
    || text.match(/(\d+)\s*MPH\s+WIND/i);
  return m ? `${m[1]} MPH WINDS` : null;
}

function parseHail(text) {
  const m = text.match(/HAIL[^\d]*(\d+(?:\.\d+)?)\s*IN(?:CH(?:ES)?)?/i)
    || text.match(/(\d+(?:\.\d+)?)\s*IN(?:CH(?:ES)?)?\s+HAIL/i);
  return m ? `${m[1]}" HAIL` : null;
}

function parseRainfall(text) {
  const m = text.match(/(\d+(?:\.\d+)?)\s+(?:TO\s+\d+(?:\.\d+)?\s+)?INCH(?:ES)?\s+OF\s+RAIN/i)
    || text.match(/RAINFALL\s+(?:OF\s+)?(\d+(?:\.\d+)?)\s+INCH/i);
  return m ? `${m[1]}" RAINFALL` : null;
}

export function buildThreatSummary(alert) {
  if (!alert) return null;
  const p = alert.properties || {};
  const desc = (p.description || '').toUpperCase();
  const event = (p.event || '').toUpperCase();
  const area = p.areaDesc || '';

  // Shorten area to first 2 regions
  const areaShort = area.split(/[;,]/).slice(0, 2).map(s => s.trim()).join(', ').toUpperCase();

  const wind = parseWind(desc) || (p.parameters?.maxWindGust?.[0] ? `${p.parameters.maxWindGust[0]} WINDS` : null);
  const hail = parseHail(desc) || (p.parameters?.maxHailSize?.[0] ? `${p.parameters.maxHailSize[0]} HAIL` : null);
  const rain = parseRainfall(desc);

  const damage = DAMAGE_KEYWORDS.find(k => k.pattern.test(desc))?.label || null;

  // Build threat string from parsed pieces
  const threats = [wind, hail, rain].filter(Boolean).join(' AND ');

  let summary = '';
  if (damage) {
    summary = threats
      ? `${damage} — ${threats} TARGETING ${areaShort}`
      : `${damage} IN EFFECT FOR ${areaShort}`;
  } else if (threats) {
    summary = `${event} — ${threats} TARGETING ${areaShort}`;
  } else {
    summary = `${event} IN EFFECT FOR ${areaShort}`;
  }

  return summary + '.';
}

export default function ThreatBanner({ topAlert }) {
  const [visible, setVisible] = useState(true);
  const [nwsHeadline, setNwsHeadline] = useState(null);
  const pollRef = useRef(null);

  const summary = buildThreatSummary(topAlert);
  const sev = topAlert?.properties?.severity || 'Unknown';
  const bgColor = SEVERITY_COLOR[sev] || SEVERITY_COLOR.Unknown;

  useEffect(() => {
    setVisible(true);
  }, [topAlert?.id]);

  // Poll /api/headline every 3 minutes when there's an active alert
  useEffect(() => {
    if (!topAlert) { setNwsHeadline(null); return; }

    async function fetchHeadline() {
      try {
        const res = await fetch('/api/headline');
        if (!res.ok) return;
        const data = await res.json();
        if (data.headline) setNwsHeadline(data.headline);
      } catch {}
    }

    fetchHeadline();
    pollRef.current = setInterval(fetchHeadline, 3 * 60 * 1000);
    return () => clearInterval(pollRef.current);
  }, [topAlert?.id]);

  if (!topAlert || !summary || !visible) return null;

  return (
    <div className="threat-banner" style={{ '--banner-color': bgColor, background: bgColor }}>
      <div className="threat-banner-inner">
        <div className="threat-banner-stack">
          <span className="threat-banner-text">{summary}</span>
          {nwsHeadline && (
            <span className="threat-banner-nws">{nwsHeadline}</span>
          )}
        </div>
      </div>
      <button className="threat-banner-close" onClick={() => setVisible(false)}>✕</button>
    </div>
  );
}
