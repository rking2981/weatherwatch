// Text-to-speech for weather alerts using the Web Speech API.
// Reads: event name, affected counties, NWS instruction or safety steps.
// Sentences are queued as separate utterances with a short pause between each.

let speaking = false;
let pauseTimers = [];

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

// NWS text abbreviations → spoken equivalents (for instruction text)
const NWS_ABBREVS = [
  [/\bNM\b/g,   'nautical miles'],
  [/\bKT\b/g,   'knots'],
  [/\bMPH\b/g,  'miles per hour'],
  [/\bMPG\b/g,  'miles per gallon'],
  [/\bFT\b/g,   'feet'],
  [/\bIN\b/g,   'inches'],
  [/\bF\b/g,    'degrees Fahrenheit'],
  [/\bC\b/g,    'degrees Celsius'],
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
  [/\bN\b/g,    'north'],
  [/\bS\b/g,    'south'],
  [/\bE\b/g,    'east'],
  [/\bW\b/g,    'west'],
];

function expandAbbrevs(text) {
  let out = text;
  for (const [pattern, replacement] of NWS_ABBREVS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function expandAreaDesc(areaDesc) {
  // areaDesc entries look like "Cherokee, KS" or "Jasper, MO"
  return areaDesc.replace(/\b([A-Z]{2})\b/g, (match) => STATE_NAMES[match] || match);
}

function buildSentences(event, areaDesc, instruction, safetySteps) {
  const sentences = [];

  sentences.push('Attention. Weather alert.');

  if (event) sentences.push(`${event}.`);

  if (areaDesc) {
    const counties = areaDesc
      .split(/[;]/)
      .map(s => expandAreaDesc(s.trim()))
      .filter(Boolean)
      .slice(0, 6)
      .join(', ');
    sentences.push(`Affected areas: ${counties}.`);
  }

  if (instruction && instruction.trim().length > 10) {
    // Split NWS instruction on sentence boundaries for individual pauses
    const chunks = expandAbbrevs(instruction.trim())
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
    sentences.push(...chunks);
  } else if (safetySteps && safetySteps.length > 0) {
    sentences.push('Safety instructions.');
    safetySteps.forEach((step, i) => {
      sentences.push(`${i + 1}. ${step}`);
    });
  }

  return sentences;
}

function makeUtterance(text, voice) {
  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.rate = 0.92;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  utter.lang = 'en-US';
  return utter;
}

// Queue sentences with a 400ms pause between each
function queueSentences(sentences, voice) {
  let delay = 0;
  sentences.forEach((text, i) => {
    const utter = makeUtterance(text, voice);

    if (i === sentences.length - 1) {
      utter.onend = () => { speaking = false; };
    }
    utter.onerror = () => { speaking = false; };

    if (i === 0) {
      window.speechSynthesis.speak(utter);
    } else {
      // Pause: speak a near-silent utterance as a gap, then the real sentence
      const pause = makeUtterance(' ', voice); // non-breaking space
      pause.rate = 10; // speak it instantly
      pause.volume = 0;
      pause.onend = () => {
        const t = setTimeout(() => {
          if (speaking) window.speechSynthesis.speak(utter);
        }, 350);
        pauseTimers.push(t);
      };
      window.speechSynthesis.speak(pause);
    }
  });
}

export function speakAlert({ event, areaDesc, instruction, safetySteps }) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  pauseTimers.forEach(clearTimeout);
  pauseTimers = [];
  speaking = true;

  const sentences = buildSentences(event, areaDesc, instruction, safetySteps);

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    queueSentences(sentences, getBestVoice());
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      queueSentences(sentences, getBestVoice());
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
}

export function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  pauseTimers.forEach(clearTimeout);
  pauseTimers = [];
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}
