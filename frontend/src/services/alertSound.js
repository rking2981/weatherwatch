// Generates severity-specific alert tones using Web Audio API.
// No external files — all tones are synthesized in the browser.

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, startTime, duration, gainVal, type = 'sine', fadeOut = true) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
  if (fadeOut) gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

function noise(startTime, duration, gainVal) {
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = ac.createBufferSource();
  source.buffer = buffer;
  const gain = ac.createGain();
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  source.start(startTime);
  source.stop(startTime + duration + 0.05);
}

// Extreme: EAS-style attention signal — three harsh descending blasts
function playExtreme() {
  const ac = getCtx();
  const t = ac.currentTime + 0.05;
  // EAS-style dual tone (853 Hz + 960 Hz simultaneously)
  const pairs = [
    [853, 960, t],
    [853, 960, t + 1.1],
    [853, 960, t + 2.2],
  ];
  for (const [f1, f2, start] of pairs) {
    tone(f1, start, 0.9, 0.4, 'square', false);
    tone(f2, start, 0.9, 0.4, 'square', false);
    // Cut off abruptly like real EAS
    const g = ac.createGain();
    g.gain.setValueAtTime(1, start + 0.85);
    g.gain.linearRampToValueAtTime(0, start + 0.9);
  }
  // Noise burst after tones
  noise(t + 3.2, 0.6, 0.15);
}

// Severe: Urgent descending siren sweep
function playSevere() {
  const ac = getCtx();
  const t = ac.currentTime + 0.05;
  for (let i = 0; i < 3; i++) {
    const start = t + i * 0.55;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1100, start);
    osc.frequency.exponentialRampToValueAtTime(600, start + 0.45);
    gain.gain.setValueAtTime(0.35, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
    osc.start(start);
    osc.stop(start + 0.55);
  }
}

// Moderate: Two-tone warning chime
function playModerate() {
  const ac = getCtx();
  const t = ac.currentTime + 0.05;
  // High-low pair, twice
  const seq = [880, 660, 880, 660];
  seq.forEach((freq, i) => {
    tone(freq, t + i * 0.22, 0.35, 0.3, 'triangle');
  });
}

// Minor: Soft single notification ping
function playMinor() {
  const ac = getCtx();
  const t = ac.currentTime + 0.05;
  tone(660, t, 0.6, 0.25, 'sine');
  tone(880, t + 0.15, 0.5, 0.15, 'sine');
}

// Unknown: Subtle double beep
function playUnknown() {
  const ac = getCtx();
  const t = ac.currentTime + 0.05;
  tone(440, t, 0.2, 0.2, 'sine');
  tone(440, t + 0.3, 0.2, 0.2, 'sine');
}

export function playAlertSound(severity) {
  try {
    switch (severity) {
      case 'Extreme':  playExtreme();  break;
      case 'Severe':   playSevere();   break;
      case 'Moderate': playModerate(); break;
      case 'Minor':    playMinor();    break;
      default:         playUnknown();  break;
    }
  } catch (err) {
    console.warn('[alertSound] Audio error:', err);
  }
}
