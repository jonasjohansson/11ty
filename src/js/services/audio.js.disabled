// music.js — Ocarina of Time inspired: soft ocarina synth + pentatonic scale

let synth = null;
let audioReady = false;
let toneLoaded = false;

// Load Tone.js only after a user gesture to avoid autoplay warnings
function loadToneOnce() {
  return new Promise((resolve, reject) => {
    if (window.Tone) {
      toneLoaded = true;
      resolve();
      return;
    }
    if (toneLoaded) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/tone@14.8.49/build/Tone.js";
    s.async = true;
    s.onload = () => {
      toneLoaded = true;
      resolve();
    };
    s.onerror = (e) => reject(e);
    document.head.appendChild(s);
  });
}

// Unlock audio + build synth chain on first gesture
export async function ensureAudio() {
  if (audioReady) return;
  await loadToneOnce().catch(() => {});
  if (!window.Tone) return;

  // Start/resume context (requires gesture)
  try {
    await Tone.start();
  } catch {}
  if (Tone.context.state !== "running") {
    try {
      await Tone.context.resume();
    } catch {}
  }

  // Ocarina-like FX chain for mystical, airy vibe
  const filter = new Tone.Filter({
    frequency: 2400,
    type: "lowpass",
    rolloff: -12,
  });

  const vibrato = new Tone.Vibrato({
    frequency: 5,
    depth: 0.08,
    wet: 0.4,
  }).start();

  const chorus = new Tone.Chorus({
    frequency: 1.5,
    delayTime: 2.5,
    depth: 0.2,
    wet: 0.3,
  }).start();

  const reverb = new Tone.Reverb({
    decay: 4.5,
    preDelay: 0.03,
    wet: 0.35,
  });

  // Create ocarina-like sound with custom waveform
  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { 
      type: "sine4", // Richer harmonic content than pure sine
    },
    envelope: { 
      attack: 0.03,    // Soft breath-like attack
      decay: 0.15, 
      sustain: 0.8,    // High sustain for held notes
      release: 0.6     // Gentle release like breath stopping
    },
    maxPolyphony: 6,
  });

  synth.chain(vibrato, filter, chorus, reverb, Tone.Destination);
  audioReady = true;
  console.log("[audio] ocarina synth ready");
}

// ---- Scale mapping (D Minor Pentatonic - Hylian sound) ----
// Pentatonic scale:Root, minor 3rd, 4th, 5th, minor 7th
const PENTATONIC = [0, 3, 5, 7, 10]; // D minor pentatonic intervals
const LOW_MIDI = 50;  // D3
const HIGH_MIDI = 74; // D5

function snapPentatonic(m) {
  const oct = Math.floor(m / 12);
  const inOct = m - oct * 12;
  let best = PENTATONIC[0],
    bestDist = Infinity;
  for (const iv of PENTATONIC) {
    const d = Math.abs(inOct - iv);
    if (d < bestDist) {
      bestDist = d;
      best = iv;
    }
  }
  return Math.max(LOW_MIDI, Math.min(HIGH_MIDI, oct * 12 + best));
}

export function indexToMidi(i, totalStrips = STRIP_COUNT) {
  // Safety checks
  if (isNaN(i) || isNaN(totalStrips) || totalStrips <= 0) {
    return LOW_MIDI;
  }

  const t = Math.max(0, Math.min(1, i / (totalStrips - 1)));
  const approx = LOW_MIDI + t * (HIGH_MIDI - LOW_MIDI);
  const fromTop = totalStrips - 1 - i;
  const trim = fromTop < 4 ? [4, 3, 2, 1][fromTop] : 0; // soften very top
  return snapLydian(approx - trim);
}

const midiToNote = (m) => window.Tone.Frequency(m, "midi").toNote();

export function playStripNote(index, velocity = 0.9, totalStrips = STRIP_COUNT) {
  if (!audioReady || !synth) return;

  // Safety checks
  if (isNaN(index) || isNaN(totalStrips) || totalStrips <= 0) {
    return;
  }

  const root = indexToMidi(index, totalStrips);
  const fifth = root + 7;
  const notes = [midiToNote(root), midiToNote(fifth)];

  try {
    synth.triggerAttackRelease(notes, "8n", undefined, velocity);
  } catch (error) {
    console.warn("Audio error:", error);
  }
}
