// Text-to-speech for weather alerts using the Web Speech API.
// One utterance per alert — TTS engine pauses naturally at punctuation.

let speaking = false;

function getBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    v => /microsoft.*natural/i.test(v.name),
    v => /microsoft.*aria/i.test(v.name),
    v => /microsoft.*jenny/i.test(v.name),
    v => /microsoft.*guy/i.test(v.name),
    v => /microsoft.*davis/i.test(v.name),
    v => /microsoft.*tony/i.test(v.name),
    v => /microsoft/i.test(v.name) && v.lang.startsWith('en'),
    v => /samantha/i.test(v.name),
    v => /karen/i.test(v.name),
    v => /daniel/i.test(v.name),
    v => v.lang.startsWith('en'),
  ];
  for (const test of preferred) {
    const match = voices.find(test);
    if (match) return match;
  }
  return null;
}

// US state abbreviations → full names (for areaDesc)
const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'Washington D.C.',
};

// NWS unit/direction abbreviations → spoken equivalents
const NWS_ABBREVS = [
  [/\bWSW\b/g,  'west-southwest'],
  [/\bWNW\b/g,  'west-northwest'],
  [/\bENE\b/g,  'east-northeast'],
  [/\bESE\b/g,  'east-southeast'],
  [/\bSSW\b/g,  'south-southwest'],
  [/\bSSE\b/g,  'south-southeast'],
  [/\bNNW\b/g,  'north-northwest'],
  [/\bNNE\b/g,  'north-northeast'],
  [/\bNW\b/g,   'northwest'],
  [/\bNE\b/g,   'northeast'],
  [/\bSW\b/g,   'southwest'],
  [/\bSE\b/g,   'southeast'],
  [/\bMPH\b/g,  'miles per hour'],
  [/\bKT\b/g,   'knots'],
  [/\bFT\b/g,   'feet'],
  // NM only in context of distance — "NM" after a number
  [/(\d+)\s*NM\b/g, '$1 nautical miles'],
];

function expandAbbrevs(text) {
  let out = text;
  for (const [pattern, replacement] of NWS_ABBREVS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function expandAreaDesc(text) {
  return text.replace(/\b([A-Z]{2})\b/g, m => STATE_NAMES[m] || m);
}

function buildScript(event, areaDesc, instruction, safetySteps) {
  const parts = [];

  parts.push('Attention. Weather alert.');
  if (event) parts.push(`${event}.`);

  if (areaDesc) {
    const counties = areaDesc
      .split(/[;]/)
      .map(s => expandAreaDesc(s.trim()))
      .filter(Boolean)
      .slice(0, 6)
      .join(', ');
    parts.push(`Affected areas: ${counties}.`);
  }

  if (instruction && instruction.trim().length > 10) {
    let text = expandAbbrevs(instruction.trim());
    if (!/[.!?]$/.test(text)) text += '.';
    parts.push(text);
  } else if (safetySteps && safetySteps.length > 0) {
    parts.push('Safety instructions.');
    safetySteps.forEach(step => {
      const s = step.trim();
      parts.push(/[.!?]$/.test(s) ? s : `${s}.`);
    });
  }

  return parts.join(' ');
}

export function speakAlert({ event, areaDesc, instruction, safetySteps }) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  speaking = true;

  const text = buildScript(event, areaDesc, instruction, safetySteps);

  const go = (voice) => {
    const utter = new SpeechSynthesisUtterance(text);
    if (voice) utter.voice = voice;
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.lang = 'en-US';
    utter.onend  = () => { speaking = false; };
    utter.onerror = () => { speaking = false; };
    window.speechSynthesis.speak(utter);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    go(getBestVoice());
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      go(getBestVoice());
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
}

export function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}
