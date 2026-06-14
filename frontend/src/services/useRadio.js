import { useState, useEffect, useRef } from 'react';
import { STATIONS, stationForAlert } from './radioStations';

export function useRadio(topAlert) {
  const audioRef = useRef(null);
  const [station, setStation] = useState(() => stationForAlert(topAlert) || STATIONS[0]);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const [autoTuned, setAutoTuned] = useState(false);

  // Create a single persistent audio element that never unmounts
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;

    audio.addEventListener('canplay', () => setLoading(false));
    audio.addEventListener('waiting', () => setLoading(true));
    audio.addEventListener('error', () => { setLoading(false); setPlaying(false); });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Auto-tune when top alert changes
  useEffect(() => {
    if (!topAlert) return;
    const match = stationForAlert(topAlert);
    if (match && match.callsign !== station?.callsign) {
      setStation(match);
      setAutoTuned(true);
      setPlaying(true);
    }
  }, [topAlert?.id]);

  // Play/pause when playing or station changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !station) return;
    if (playing) {
      audio.src = station.url;
      audio.load();
      setLoading(true);
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [playing, station?.url]);

  // Volume/mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  function tuneToStation(s) {
    setStation(s);
    setAutoTuned(false);
    setPlaying(true);
  }

  function togglePlay() {
    if (!station) return;
    setPlaying(p => !p);
  }

  return { station, playing, muted, volume, loading, autoTuned, tuneToStation, togglePlay, setMuted, setVolume };
}
