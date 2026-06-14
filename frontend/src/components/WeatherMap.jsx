import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Style, Fill, Stroke, Text, Icon } from 'ol/style';
import { defaults as defaultControls } from 'ol/control';
import RadarLegend from './RadarLegend';
import 'ol/ol.css';
import './WeatherMap.css';

// NWS-standard event-type colors
const EVENT_COLORS = {
  // Tornado
  'Tornado Warning':                    { stroke: '#ff0000', fill: 'rgba(255,0,0,0.25)',       width: 2.5 },
  'Tornado Watch':                      { stroke: '#ffff00', fill: 'rgba(255,255,0,0.15)',      width: 2 },
  'Tornado Emergency':                  { stroke: '#ff00ff', fill: 'rgba(255,0,255,0.3)',       width: 3 },
  // Severe Thunderstorm
  'Severe Thunderstorm Warning':        { stroke: '#ff9000', fill: 'rgba(255,144,0,0.25)',      width: 2.5 },
  'Severe Thunderstorm Watch':          { stroke: '#db8d00', fill: 'rgba(219,141,0,0.15)',      width: 2 },
  // Flood
  'Flash Flood Warning':                { stroke: '#00ff00', fill: 'rgba(0,255,0,0.2)',         width: 2.5 },
  'Flash Flood Watch':                  { stroke: '#2e8b57', fill: 'rgba(46,139,87,0.15)',      width: 2 },
  'Flash Flood Emergency':              { stroke: '#00ff00', fill: 'rgba(0,220,0,0.35)',        width: 3 },
  'Flood Warning':                      { stroke: '#00bb00', fill: 'rgba(0,187,0,0.2)',         width: 2 },
  'Flood Watch':                        { stroke: '#2e8b57', fill: 'rgba(46,139,87,0.12)',      width: 1.5 },
  'Flood Advisory':                     { stroke: '#00aa44', fill: 'rgba(0,170,68,0.1)',        width: 1.5 },
  'Hydrologic Outlook':                 { stroke: '#00aa44', fill: 'rgba(0,170,68,0.08)',       width: 1 },
  // Winter
  'Blizzard Warning':                   { stroke: '#ff4dff', fill: 'rgba(255,77,255,0.2)',      width: 2.5 },
  'Winter Storm Warning':               { stroke: '#ff69b4', fill: 'rgba(255,105,180,0.2)',     width: 2 },
  'Winter Storm Watch':                 { stroke: '#4169e1', fill: 'rgba(65,105,225,0.15)',     width: 2 },
  'Winter Weather Advisory':            { stroke: '#7b68ee', fill: 'rgba(123,104,238,0.12)',    width: 1.5 },
  'Ice Storm Warning':                  { stroke: '#8b008b', fill: 'rgba(139,0,139,0.2)',       width: 2 },
  'Freezing Rain Advisory':             { stroke: '#da70d6', fill: 'rgba(218,112,214,0.12)',    width: 1.5 },
  'Wind Chill Warning':                 { stroke: '#b0c4de', fill: 'rgba(176,196,222,0.15)',    width: 2 },
  'Wind Chill Advisory':                { stroke: '#afeeee', fill: 'rgba(175,238,238,0.1)',     width: 1.5 },
  // Wind
  'Extreme Wind Warning':               { stroke: '#ff8c00', fill: 'rgba(255,140,0,0.25)',      width: 2.5 },
  'High Wind Warning':                  { stroke: '#daa520', fill: 'rgba(218,165,32,0.2)',      width: 2 },
  'High Wind Watch':                    { stroke: '#b8860b', fill: 'rgba(184,134,11,0.15)',     width: 2 },
  'Wind Advisory':                      { stroke: '#d2b48c', fill: 'rgba(210,180,140,0.12)',    width: 1.5 },
  // Heat
  'Excessive Heat Warning':             { stroke: '#c71585', fill: 'rgba(199,21,133,0.2)',      width: 2.5 },
  'Excessive Heat Watch':               { stroke: '#ff6347', fill: 'rgba(255,99,71,0.15)',      width: 2 },
  'Heat Advisory':                      { stroke: '#ff7f50', fill: 'rgba(255,127,80,0.15)',     width: 1.5 },
  // Fog / Air
  'Dense Fog Advisory':                 { stroke: '#708090', fill: 'rgba(112,128,144,0.15)',    width: 1.5 },
  'Air Quality Alert':                  { stroke: '#808000', fill: 'rgba(128,128,0,0.12)',      width: 1.5 },
  // Tropical
  'Hurricane Warning':                  { stroke: '#ff0000', fill: 'rgba(255,0,0,0.25)',        width: 3 },
  'Hurricane Watch':                    { stroke: '#ff69b4', fill: 'rgba(255,105,180,0.2)',     width: 2.5 },
  'Tropical Storm Warning':             { stroke: '#b22222', fill: 'rgba(178,34,34,0.2)',       width: 2 },
  'Tropical Storm Watch':               { stroke: '#f08080', fill: 'rgba(240,128,128,0.15)',    width: 2 },
  // Tsunami / Earthquake
  'Tsunami Warning':                    { stroke: '#fd6347', fill: 'rgba(253,99,71,0.3)',       width: 3 },
  'Dust Storm Warning':                 { stroke: '#c2a04b', fill: 'rgba(194,160,75,0.2)',      width: 2 },
};

// Flaticon CDN — colored illustrated weather icons
// Correct format: /128/{first4digits}/{fullid}.png
const FI = id => {
  const sub = String(id).slice(0, 4);
  return `https://cdn-icons-png.flaticon.com/128/${sub}/${id}.png`;
};

const EVENT_ICONS = {
  // Tornado
  'Tornado Warning':               FI(9211885),  // hurricane/twister
  'Tornado Watch':                 FI(9211885),
  'Tornado Emergency':             FI(9211885),
  // Severe Thunderstorm
  'Severe Thunderstorm Warning':   FI(1146869),  // thunderstorm cloud lightning
  'Severe Thunderstorm Watch':     FI(1146869),
  // Flood
  'Flash Flood Warning':           FI(3911414),  // flood wave
  'Flash Flood Watch':             FI(3911414),
  'Flash Flood Emergency':         FI(3911414),
  'Flood Warning':                 FI(2675268),  // flood house
  'Flood Watch':                   FI(2675268),
  'Flood Advisory':                FI(2675268),
  'Hydrologic Outlook':            FI(2675268),
  // Winter
  'Blizzard Warning':              FI(3222794),  // snowstorm cloud
  'Winter Storm Warning':          FI(2315309),  // winter storm cloud snow
  'Winter Storm Watch':            FI(2315309),
  'Winter Weather Advisory':       FI(2315309),
  'Ice Storm Warning':             FI(2932694),  // ice crystal
  'Freezing Rain Advisory':        FI(2932694),
  'Wind Chill Warning':            FI(3222800),  // cold thermometer wind
  'Wind Chill Advisory':           FI(3222800),
  // Wind
  'Extreme Wind Warning':          FI(3222788),  // strong wind
  'High Wind Warning':             FI(3222788),
  'High Wind Watch':               FI(3222788),
  'Wind Advisory':                 FI(3222788),
  // Heat
  'Excessive Heat Warning':        FI(2917231),  // heat thermometer sun
  'Excessive Heat Watch':          FI(2917231),
  'Heat Advisory':                 FI(2917231),
  // Fog / Air
  'Dense Fog Advisory':            FI(3222796),  // fog cloud
  'Air Quality Alert':             FI(3418077),  // air pollution smog
  // Tropical
  'Hurricane Warning':             FI(9211885),  // same cyclone icon
  'Hurricane Watch':               FI(9211885),
  'Tropical Storm Warning':        FI(9211885),
  'Tropical Storm Watch':          FI(9211885),
  // Other
  'Tsunami Warning':               FI(3911414),  // wave
  'Dust Storm Warning':            FI(3222788),  // wind
  'Special Weather Statement':     FI(1146869),  // storm cloud
  'Special Marine Warning':        FI(3911424),  // ocean wave
};

const DESTRUCTIVE_WIND_MPH = 80;

// Cache Icon instances by URL so OL doesn't reload the same image repeatedly
const iconCache = {};
function getIcon(url, scale = 0.35) {
  const key = `${url}_${scale}`;
  if (!iconCache[key]) {
    iconCache[key] = new Icon({ src: url, scale, crossOrigin: 'anonymous' });
  }
  return iconCache[key];
}

function alertStyle(feature) {
  const event   = feature.get('event') || '';
  const desc    = (feature.get('description') || '').toUpperCase();
  const params  = feature.get('parameters') || {};

  // Detect destructive wind threshold for severe thunderstorm warnings
  let isDestructive = false;
  if (event === 'Severe Thunderstorm Warning') {
    const windGust = parseInt(params.maxWindGust?.[0]) || 0;
    const windMatch = desc.match(/(\d+)\s*MPH/);
    const windMph = windMatch ? parseInt(windMatch[1]) : 0;
    isDestructive = windGust >= DESTRUCTIVE_WIND_MPH || windMph >= DESTRUCTIVE_WIND_MPH
      || /DESTRUCTIVE/i.test(desc);
  }

  const colors = isDestructive
    ? { stroke: '#ff4500', fill: 'rgba(255,69,0,0.3)', width: 3 }
    : EVENT_COLORS[event] || { stroke: '#78909c', fill: 'rgba(120,144,156,0.15)', width: 1.5 };

  const iconUrl = EVENT_ICONS[event];

  const polyStyle = new Style({
    fill:   new Fill({ color: colors.fill }),
    stroke: new Stroke({ color: colors.stroke, width: colors.width }),
  });

  if (!iconUrl) return polyStyle;

  // Icon must be placed on a Point geometry — use the polygon's interior point
  const iconStyle = new Style({
    geometry: feature => {
      const geom = feature.getGeometry();
      return geom?.getInteriorPoint?.() ?? geom;
    },
    image: getIcon(iconUrl),
  });

  return [polyStyle, iconStyle];
}

function alertExtent(alert) {
  const geom = alert?.geometry;
  if (!geom) return null;

  const rings = geom.type === 'Polygon' ? [geom.coordinates[0]]
    : geom.type === 'MultiPolygon' ? geom.coordinates.map(p => p[0])
    : null;
  if (!rings) return null;

  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return transformExtent([minLon, minLat, maxLon, maxLat], 'EPSG:4326', 'EPSG:3857');
}

export default function WeatherMap({ alerts, selectedAlert, topAlert, pulseAlertId, onAlertClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const alertLayerRef = useRef(null);
  const radarLayerRef = useRef(null);
  const pulseRef = useRef({ id: null, phase: false });
  const [showRadar, setShowRadar] = useState(true);
  const [radarRefreshedAt, setRadarRefreshedAt] = useState(new Date());

  // Initialize map once
  useEffect(() => {
    const osmLayer = new TileLayer({ source: new OSM() });

    // Labels-only layer rendered above radar so city/town/state names are always visible
    const labelsLayer = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
        attributions: '© <a href="https://carto.com/">CARTO</a>',
      }),
      opacity: 1,
      zIndex: 10,
    });
    labelsLayer.set('name', 'labels');

    const radarLayer = new TileLayer({
      source: new TileWMS({
        url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0q.cgi',
        params: { LAYERS: 'nexrad-n0q-900913', FORMAT: 'image/png', TRANSPARENT: true },
        serverType: 'geoserver',
      }),
      opacity: 0.65,
    });
    radarLayer.set('name', 'radar');
    radarLayerRef.current = radarLayer;

    const alertSource = new VectorSource();
    const alertLayer = new VectorLayer({ source: alertSource, style: alertStyle });
    alertLayerRef.current = alertLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [osmLayer, radarLayer, alertLayer, labelsLayer],
      overlays: [],
      controls: defaultControls({ zoom: false, attribution: true }),
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]),
        zoom: 4,
      }),
    });

    map.on('click', evt => {
      // Only check vector layers (alert polygons) — skip tile layers
      const features = map.getFeaturesAtPixel(evt.pixel, {
        layerFilter: l => l === alertLayer,
      });
      if (features && features.length > 0) {
        const SEVERITY_RANK = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
        const sorted = [...features].sort((a, b) =>
          (SEVERITY_RANK[a.get('severity')] ?? 4) - (SEVERITY_RANK[b.get('severity')] ?? 4)
        );
        const f = sorted[0];
        const props = f.getProperties();
        const id = f.getId() || props.id;
        onAlertClick({ id, properties: { ...props, id } });
      } else {
        onAlertClick(null);
      }
    });

    mapInstance.current = map;

    return () => map.setTarget(null);
  }, []);

  // Sync alert polygons
  useEffect(() => {
    const source = alertLayerRef.current?.getSource();
    if (!source) return;
    source.clear();

    const featureCollection = { type: 'FeatureCollection', features: alerts };
    const format = new GeoJSON();
    const features = format.readFeatures(featureCollection, {
      featureProjection: 'EPSG:3857',
    });
    source.addFeatures(features);
  }, [alerts]);

  // Refresh radar tiles every 60 seconds
  useEffect(() => {
    const id = setInterval(() => {
      radarLayerRef.current?.getSource()?.updateParams({ _t: Date.now() });
      setRadarRefreshedAt(new Date());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Auto-zoom to highest severity alert whenever it changes
  useEffect(() => {
    if (!topAlert || !mapInstance.current) return;
    const extent = alertExtent(topAlert);
    if (!extent) return;
    mapInstance.current.getView().fit(extent, {
      duration: 800,
      padding: [60, 60, 130, 60], // extra bottom padding for ticker
      maxZoom: 9,
    });
  }, [topAlert?.id]);

  // Pan to selected alert
  useEffect(() => {
    if (!selectedAlert || !mapInstance.current) return;
    const geom = selectedAlert.geometry;
    if (!geom) return;

    // Compute centroid of first polygon ring
    const coords = geom.type === 'Polygon' ? geom.coordinates[0]
      : geom.type === 'MultiPolygon' ? geom.coordinates[0][0]
      : null;
    if (!coords) return;

    const lon = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;

    mapInstance.current.getView().animate({
      center: fromLonLat([lon, lat]),
      zoom: 7,
      duration: 600,
    });
  }, [selectedAlert]);

  // Toggle radar layer
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.getLayers().forEach(layer => {
      if (layer.get('name') === 'radar') layer.setVisible(showRadar);
    });
  }, [showRadar]);

  // Pulse the border of the alert polygon matching pulseAlertId
  useEffect(() => {
    pulseRef.current.id = pulseAlertId;
    pulseRef.current.phase = false;

    if (!pulseAlertId) {
      // Reset all features to normal style
      alertLayerRef.current?.getSource()?.getFeatures()?.forEach(f => f.setStyle(null));
      return;
    }

    const interval = setInterval(() => {
      const source = alertLayerRef.current?.getSource();
      if (!source) return;
      pulseRef.current.phase = !pulseRef.current.phase;
      const bright = pulseRef.current.phase;

      source.getFeatures().forEach(feature => {
        const fid = feature.get('id') || feature.getId();
        if (fid === pulseAlertId) {
          const ev      = feature.get('event');
          const base    = EVENT_COLORS[ev] || { stroke: '#ffffff', fill: 'rgba(255,255,255,0.2)', width: 2 };
          const iconUrl = EVENT_ICONS[ev];
          const styles = [new Style({
            fill: new Fill({ color: base.fill }),
            stroke: new Stroke({
              color: bright ? '#ffffff' : base.stroke,
              width: bright ? base.width + 2.5 : base.width,
            }),
          })];
          if (iconUrl) {
            styles.push(new Style({
              geometry: f => f.getGeometry()?.getInteriorPoint?.() ?? f.getGeometry(),
              image: getIcon(iconUrl),
            }));
          }
          feature.setStyle(styles);
        } else {
          feature.setStyle(null);
        }
      });
    }, 600);

    return () => {
      clearInterval(interval);
      // Reset all to layer default on cleanup
      alertLayerRef.current?.getSource()?.getFeatures()?.forEach(f => f.setStyle(null));
    };
  }, [pulseAlertId]);

  return (
    <div className="weather-map-wrap">
      <div ref={mapRef} className="weather-map" />

      {/* Radar legend — top right */}
      <RadarLegend refreshedAt={radarRefreshedAt} />

      {/* Radar toggle button — below legend */}
      <div className="map-controls">
        <button
          className={`map-toggle ${showRadar ? 'active' : ''}`}
          onClick={() => setShowRadar(v => !v)}
        >
          {showRadar ? '🌧 Radar ON' : '🌧 Radar OFF'}
        </button>
      </div>

    </div>
  );
}
