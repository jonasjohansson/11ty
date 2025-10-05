// Xylophone sound generator using Web Audio API

let audioContext = null;

// Initialize audio context on first user interaction
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Generate a wooden xylophone-like tone
function playNote(frequency, duration = 0.3) {
  const ctx = initAudio();

  // Create oscillator for the main tone
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Use triangle wave for a more wooden sound
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  // Add slight detuning for richer sound
  const oscillator2 = ctx.createOscillator();
  oscillator2.type = "triangle";
  oscillator2.frequency.setValueAtTime(frequency * 1.01, ctx.currentTime);

  // Envelope for natural decay - softer volume
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02); // Softer, slower attack
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration); // Gentle decay

  // Add a filter for warmth - more mellow
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1200, ctx.currentTime); // Lower cutoff for softer sound
  filter.Q.setValueAtTime(0.5, ctx.currentTime); // Less resonance for smoother tone

  // Connect the audio graph
  oscillator.connect(filter);
  oscillator2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play the note
  oscillator.start(ctx.currentTime);
  oscillator2.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
  oscillator2.stop(ctx.currentTime + duration);
}

// Map strip index to musical scale (pentatonic for pleasant sounds)
function getFrequencyForStrip(index, totalStrips) {
  // C major pentatonic scale starting at C4 (261.63 Hz)
  const baseFreq = 261.63;
  const pentatonicIntervals = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3]; // Major pentatonic ratios

  // Map strip position to scale
  const octaveSpan = 2; // Span 2 octaves
  const normalizedPosition = index / (totalStrips - 1); // 0 to 1
  const octave = Math.floor(normalizedPosition * octaveSpan);
  const scaleIndex = Math.floor(((normalizedPosition * octaveSpan) % 1) * pentatonicIntervals.length);

  const frequency = baseFreq * Math.pow(2, octave) * pentatonicIntervals[scaleIndex];
  return frequency;
}

export function initXylophone() {
  const stripsContainer = document.getElementById("strips");
  if (!stripsContainer) return;

  const strips = Array.from(stripsContainer.querySelectorAll(".strip"));

  strips.forEach((strip, index) => {
    strip.addEventListener("mouseenter", () => {
      const frequency = getFrequencyForStrip(index, strips.length);
      playNote(frequency, 0.4);
    });

    // Also play on touch for mobile
    strip.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        const frequency = getFrequencyForStrip(index, strips.length);
        playNote(frequency, 0.4);
      },
      { passive: false }
    );
  });

  console.log("🎵 Xylophone initialized - hover over strips to play notes!");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initXylophone);
} else {
  initXylophone();
}
