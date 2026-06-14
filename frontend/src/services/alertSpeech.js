// Text-to-speech for weather alerts using the Web Speech API.
// Reads: event name, affected counties, NWS instruction or safety steps.

let speaking = false;

function getBestVoice() {
  const voices = window.speechSynthesis.getVoices();
  // Prefer high-quality English neural/natural voices in order of quality
  const preferred = [
    // Windows — Microsoft Neural voices (very realistic)
    v => /microsoft.*natural/i.test(v.name),
    v => /microsoft.*aria/i.test(v.name),
    v => /microsoft.*jenny/i.test(v.name),
    v => /microsoft.*guy/i.test(v.name),
    v => /microsoft.*davis/i.test(v.name),
    v => /microsoft.*tony/i.test(v.name),
    v => /microsoft/i.test(v.name) && v.lang.startsWith('en'),
    // macOS / iOS — Siri-quality voices
    v => /samantha/i.test(v.name),
    v => /karen/i.test(v.name),
    v => /daniel/i.test(v.name),
    // Generic English fallback
    v => v.lang.startsWith('en'),
  ];

  for (const test of preferred) {
    const match = voices.find(test);
    if (match) return match;
  }
  return null;
}

function buildScript(event, areaDesc, instruction, safetySteps) {
  const parts = [];

  // Attention tone phrase
  parts.push('Attention. Weather alert.');

  // Event name
  if (event) parts.push(`${event}.`);

  // Counties / area — clean up the raw areaDesc string
  if (areaDesc) {
    const counties = areaDesc
      .split(/[;]/)
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 6)
      .join(', ');
    parts.push(`Affected areas: ${counties}.`);
  }

  // NWS instruction text takes priority over generated safety steps
  if (instruction && instruction.trim().length > 10) {
    parts.push(instruction.trim());
  } else if (safetySteps && safetySteps.length > 0) {
    parts.push('Safety instructions:');
    safetySteps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`);
    });
  }

  return parts.join(' ');
}

export function speakAlert({ event, areaDesc, instruction, safetySteps }) {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech first
  window.speechSynthesis.cancel();
  speaking = false;

  const text = buildScript(event, areaDesc, instruction, safetySteps);
  const utter = new SpeechSynthesisUtterance(text);

  // Voices may not be loaded yet — wait if needed
  const assign = () => {
    const voice = getBestVoice();
    if (voice) utter.voice = voice;
    utter.rate = 0.92;   // slightly slower — clearer for emergency info
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.lang = 'en-US';
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    assign();
    window.speechSynthesis.speak(utter);
    speaking = true;
  } else {
    // Voices load asynchronously on first call
    window.speechSynthesis.onvoiceschanged = () => {
      assign();
      window.speechSynthesis.speak(utter);
      speaking = true;
      window.speechSynthesis.onvoiceschanged = null;
    };
  }

  utter.onend = () => { speaking = false; };
  utter.onerror = () => { speaking = false; };
}

export function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  speaking = false;
}

export function isSpeaking() {
  return speaking;
}
