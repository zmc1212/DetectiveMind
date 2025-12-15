
// Singleton AudioContext to manage browser resource limits
let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return null;
  
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
};

export const playTypingSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Browsers require user interaction to resume AudioContext
  if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
  }

  // Create a short, crisp "click" or "tick" sound
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  // Filter to make it sound more mechanical/muffled
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  // Randomize pitch slightly for realism
  osc.frequency.setValueAtTime(400 + Math.random() * 100, ctx.currentTime);
  osc.type = 'square'; // Square wave gives a "clicky" feel
  
  // Envelope for a short percussive sound
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
};

export const playSelectSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
};
