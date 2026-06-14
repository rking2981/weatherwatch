import React, { useEffect, useState } from 'react';
import { playAlertSound } from '../services/alertSound';
import { getSafetyActions } from '../services/safetyActions';
import './AlertPopup.css';

function parseBulletin(desc, instruction, params) {
  if (!desc) return null;

  const grab = (pattern) => {
    const m = desc.match(pattern);
    return m ? m[1].replace(/\s+/g, ' ').trim() : null;
  };

  const hazard   = grab(/HAZARD\.\.\.(.+?)(?=\n\n|\nSOURCE|\nIMPACT|\nLOCATIONS|$)/is);
  const source   = grab(/SOURCE\.\.\.(.+?)(?=\n\n|\nHAZARD|\nIMPACT|\nLOCATIONS|$)/is);
  const impact   = grab(/IMPACT\.\.\.(.+?)(?=\n\n|\n\*|\nPRECAUTIONARY|$)/is);
  const locations = grab(/Locations impacted include[^.]*\.\.\.\n?([\s\S]+?)(?=\n\n|This includes|$)/i)
    || grab(/\* Locations impacted include[^.]*\.\.\.\n?([\s\S]+?)(?=\n\n|This includes|$)/i);
  const highway  = grab(/(This includes (?:Interstate|US|State).+?\.)/i);

  // Motion from parameters
  const motion = params?.eventMotionDescription?.[0] || null;
  const motionStr = motion ? (() => {
    const m = motion.match(/(\d+)DEG[.\s]+(\d+)KT/);
    return m ? `Moving ${m[1]}° at ${Math.round(parseInt(m[2]) * 1.15)} MPH` : null;
  })() : null;

  const detection = params?.tornadoDetection?.[0] || null;
  const vtec      = params?.VTEC?.[0] || null;
  const cmaMsg    = params?.CMAMlongtext?.[0] || null;

  // Rotation: parse from eventMotionDescription
  // Format: "2026-06-14T04:13:00-00:00...storm...290DEG...35KT...37.11,-94.42"
  let rotation = null;
  if (motion && detection) {
    const deg = motion.match(/(\d+)DEG/)?.[1];
    const kt  = motion.match(/(\d+)KT/)?.[1];
    const loc = motion.match(/([\d.-]+),([\d.-]+)$/);
    if (deg && kt) {
      const mph = Math.round(parseInt(kt) * 1.15);
      const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
      const dir = dirs[Math.round(parseInt(deg) / 22.5) % 16];
      rotation = {
        direction: `${deg}° (FROM ${dir})`,
        speed: `${mph} MPH`,
        location: loc ? `${parseFloat(loc[1]).toFixed(2)}°N, ${Math.abs(parseFloat(loc[2])).toFixed(2)}°W` : null,
        type: detection,
      };
    }
  }

  return { hazard, source, impact, locations, highway, motionStr, detection, vtec, cmaMsg, instruction, rotation };
}

const NWS_BASE = 'https://www.weather.gov';

const SEVERITY_COLOR = {
  Extreme:  '#b71c1c',
  Severe:   '#e53935',
  Moderate: '#e65100',
  Minor:    '#f9a825',
  Unknown:  '#37474f',
};

function parseParam(text, pattern) {
  if (!text) return null;
  const m = text.match(pattern);
  return m ? m[1].trim() : null;
}

function expiresIn(expiresStr) {
  if (!expiresStr) return null;
  const diff = new Date(expiresStr) - Date.now();
  if (diff <= 0) return 'Expired';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} MIN`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs} HR ${rem} MIN` : `${hrs} HR`;
}

function parseCounties(areaDesc) {
  if (!areaDesc) return null;
  // NOAA areaDesc is often "County1; County2; ..." or "County1, County2 (ST)"
  const counties = areaDesc
    .split(/[;,]/)
    .map(s => s.replace(/\(.*?\)/g, '').trim())
    .filter(Boolean)
    .slice(0, 4); // cap at 4 for display
  return counties.join(', ');
}

export default function AlertPopup({ alerts, onDismiss, onZoom, onTuneRadio, silent = false }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showBulletin, setShowBulletin] = useState(false);

  const alert = alerts[index];
  const p = alert?.properties || {};
  const sev = p.severity || 'Unknown';
  const color = SEVERITY_COLOR[sev] || SEVERITY_COLOR.Unknown;

  // Extract structured params from the alert description
  const desc = p.description || '';
  const params = p.parameters || {};
  const maxHail = params.maxHailSize?.[0]
    || parseParam(desc, /HAIL[.\s]+UP TO ([0-9.]+\s*IN)/i)
    || parseParam(desc, /HAIL\.\.\.([0-9./]+\s*IN(?:CH(?:ES)?)?)/i);
  const maxWind = params.maxWindGust?.[0]
    || parseParam(desc, /WIND[S]?\s+(?:GUSTS?\s+(?:UP TO\s+)?)?([0-9]+\s*MPH)/i)
    || parseParam(desc, /WINDS?\.\.\.([0-9]+\s*MPH)/i);

  const expires = expiresIn(p.expires);
  const counties = parseCounties(p.areaDesc);
  const safety = getSafetyActions(p.event, sev);
  const bulletin = parseBulletin(p.description, p.instruction, p.parameters);

  // Play severity-specific sound when alert changes (suppressed for map-click popups)
  useEffect(() => {
    setVisible(true);
    setShowBulletin(false);
    if (!silent) playAlertSound(alerts[index]?.properties?.severity);
  }, [index, alerts.length]);

  function dismiss() {
    if (index < alerts.length - 1) {
      setIndex(i => i + 1);
    } else {
      onDismiss();
    }
  }

  if (!alert || !visible) return null;

  return (
    <div className="alert-popup-backdrop" onClick={onDismiss}>
    <div className="alert-popup-row" onClick={e => e.stopPropagation()}>
    <div className="alert-popup" style={{ '--popup-color': color, borderColor: color }}>
      <div className="popup-header" style={{ background: color }}>
        <div className="popup-title-block">
          <div className="popup-event">{(p.event || 'WEATHER ALERT').toUpperCase()}</div>
          {p.headline && (
            <div className="popup-headline-text">{p.headline}</div>
          )}
          {expires && (
            <div className="popup-expires">EXPIRES IN {expires}</div>
          )}
        </div>
        <button className="popup-close" onClick={onDismiss}>✕</button>
      </div>

      <div className="popup-body">
        <div className="popup-chips">
          {p.severity && (
            <div className="popup-chip" style={{ borderColor: color }}>
              <span className="chip-label">SEVERITY</span>
              <span className="chip-value" style={{ color }}>{p.severity.toUpperCase()}</span>
            </div>
          )}
          {p.urgency && (
            <div className="popup-chip" style={{ borderColor: color }}>
              <span className="chip-label">URGENCY</span>
              <span className="chip-value">{p.urgency.toUpperCase()}</span>
            </div>
          )}
          {p.certainty && (
            <div className="popup-chip" style={{ borderColor: color }}>
              <span className="chip-label">CERTAINTY</span>
              <span className="chip-value">{p.certainty.toUpperCase()}</span>
            </div>
          )}
        </div>

        {(maxHail || maxWind) && (
          <div className="popup-chips">
            {maxHail && (
              <div className="popup-chip" style={{ borderColor: color }}>
                <span className="chip-label">MAX HAIL</span>
                <span className="chip-value" style={{ color }}>{maxHail.toUpperCase()}</span>
              </div>
            )}
            {maxWind && (
              <div className="popup-chip" style={{ borderColor: color }}>
                <span className="chip-label">MAX WIND</span>
                <span className="chip-value" style={{ color }}>{maxWind.toUpperCase()}</span>
              </div>
            )}
          </div>
        )}

        {counties && (
          <div className="popup-row">
            <span className="popup-row-label">COUNTIES</span>
            <span className="popup-row-value">{counties.toUpperCase()}</span>
          </div>
        )}

        {p.senderName && (
          <div className="popup-row">
            <span className="popup-row-label">ISSUED BY</span>
            <span className="popup-row-value">{p.senderName}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="popup-actions">
        {onZoom && (
          <button
            className="popup-action-btn"
            style={{ '--action-color': color }}
            onClick={() => { onZoom(alert); onDismiss(); }}
            title="Zoom map to alert area"
          >
            <span className="action-icon">🗺</span>
            <span>ZOOM TO AREA</span>
          </button>
        )}
        {onTuneRadio && (
          <button
            className="popup-action-btn"
            style={{ '--action-color': color }}
            onClick={() => { onTuneRadio(alert); onDismiss(); }}
            title="Tune weather radio to this area"
          >
            <span className="action-icon">📻</span>
            <span>TUNE RADIO</span>
          </button>
        )}
        <button
          className="popup-action-btn"
          style={{ '--action-color': color }}
          onClick={() => {
            const url = alert.id || window.location.href;
            navigator.clipboard?.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          title="Copy alert link"
        >
          <span className="action-icon">{copied ? '✓' : '🔗'}</span>
          <span>{copied ? 'COPIED!' : 'COPY LINK'}</span>
        </button>
        <a
          className="popup-action-btn popup-action-link"
          style={{ '--action-color': color }}
          href={NWS_BASE}
          target="_blank"
          rel="noreferrer"
          title="View on weather.gov"
        >
          <span className="action-icon">↗</span>
          <span>WEATHER.GOV</span>
        </a>
      </div>

      {/* Full Bulletin toggle */}
      {bulletin && (
        <div className="popup-bulletin-wrap">
          <button
            className="popup-bulletin-toggle"
            style={{ color }}
            onClick={() => setShowBulletin(s => !s)}
          >
            {showBulletin ? '▲ HIDE BULLETIN' : '▼ FULL BULLETIN'}
          </button>

          {showBulletin && (
            <div className="popup-bulletin">
              {/* Rotation block — tornado alerts only */}
              {bulletin.rotation && (
                <div className="bulletin-rotation" style={{ borderColor: color, background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                  <div className="bulletin-rotation-title" style={{ color }}>🌪 ROTATION DETECTED</div>
                  <div className="bulletin-rotation-grid">
                    <div className="bulletin-rotation-item">
                      <span className="bulletin-rotation-label">TYPE</span>
                      <span className="bulletin-rotation-value">{bulletin.rotation.type}</span>
                    </div>
                    <div className="bulletin-rotation-item">
                      <span className="bulletin-rotation-label">DIRECTION</span>
                      <span className="bulletin-rotation-value">{bulletin.rotation.direction}</span>
                    </div>
                    <div className="bulletin-rotation-item">
                      <span className="bulletin-rotation-label">SPEED</span>
                      <span className="bulletin-rotation-value">{bulletin.rotation.speed}</span>
                    </div>
                    {bulletin.rotation.location && (
                      <div className="bulletin-rotation-item">
                        <span className="bulletin-rotation-label">POSITION</span>
                        <span className="bulletin-rotation-value">{bulletin.rotation.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {bulletin.instruction && (
                <div className="bulletin-instruction" style={{ borderColor: color }}>
                  {bulletin.instruction}
                </div>
              )}
              {bulletin.hazard && (
                <div className="bulletin-row">
                  <span className="bulletin-label">HAZARD</span>
                  <span className="bulletin-value">{bulletin.hazard}</span>
                </div>
              )}
              {bulletin.source && (
                <div className="bulletin-row">
                  <span className="bulletin-label">SOURCE</span>
                  <span className="bulletin-value">{bulletin.source}</span>
                </div>
              )}
              {bulletin.motionStr && (
                <div className="bulletin-row">
                  <span className="bulletin-label">MOTION</span>
                  <span className="bulletin-value">{bulletin.motionStr}</span>
                </div>
              )}
              {bulletin.impact && (
                <div className="bulletin-row">
                  <span className="bulletin-label">IMPACT</span>
                  <span className="bulletin-value">{bulletin.impact}</span>
                </div>
              )}
              {bulletin.locations && (
                <div className="bulletin-row">
                  <span className="bulletin-label">LOCATIONS</span>
                  <span className="bulletin-value">{bulletin.locations}{bulletin.highway ? ' ' + bulletin.highway : ''}</span>
                </div>
              )}
              {bulletin.vtec && (
                <div className="bulletin-row">
                  <span className="bulletin-label">VTEC</span>
                  <span className="bulletin-value bulletin-mono">{bulletin.vtec}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {alerts.length > 1 && (
        <div className="popup-footer">
          <span className="popup-count">{index + 1} of {alerts.length} new alerts</span>
          <button className="popup-next" style={{ color }} onClick={dismiss}>
            Next Alert →
          </button>
        </div>
      )}

    </div>{/* .alert-popup */}

      {/* Safety panel — only for Extreme/Severe with known guidance */}
      {safety && (
        <div className="safety-panel" style={{ '--popup-color': color }}>
          <div className="safety-panel-header">
            <span className="safety-icon">{safety.icon}</span>
            <span className="safety-heading">{safety.heading}</span>
          </div>
          <ol className="safety-steps">
            {safety.steps.map((step, i) => (
              <li key={i} className="safety-step">{step}</li>
            ))}
          </ol>
        </div>
      )}

    </div>{/* .alert-popup-row */}
    </div>
  );
}
