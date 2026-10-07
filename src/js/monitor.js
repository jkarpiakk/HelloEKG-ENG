// Bedside-monitor sweep: the trace is written left → right in real time with
// an erase gap ahead of the cursor, at true 25 mm/s and 10 mm/mV.
import { dissociated, CASE } from './ecg-synth.js';

const ATRIAL = 88;
const VENT = 40;
const OFFSET = 0.37; // first QRS onset (s)
const RR = 60 / VENT;

export function mountMonitor(root, { onBeat } = {}) {
  const box = root.querySelector('.monitor__traces');
  const canvas = root.querySelector('[data-trace]');
  const ctx = canvas.getContext('2d');
  const leads = [CASE.II, CASE.III, CASE.aVL].map((L) => dissociated(L, { atrial: ATRIAL, ventricular: VENT, offset: OFFSET }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = root.querySelector('[data-clock]');
  const beatIcon = root.querySelector('[data-beat]');

  let W = 0, H = 0, dpr = 1, mm = 5, rowH = 0;
  let x = 0;       // cursor position in CSS px
  let t = 0;       // signal time at cursor
  let last = [];   // last y per row
  let raf = 0, prev = 0, running = false;
  let nextBeat = OFFSET;

  function layout() {
    const r = box.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    mm = parseFloat(getComputedStyle(box).getPropertyValue('--mm')) || 5;
    rowH = H / 3;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1.7;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#3EE6A8';
    ctx.clearRect(0, 0, W, H);
    x = 0;
    last = [];
    if (reduce) drawStatic();
  }

  const y = (row, v) => rowH * row + rowH * 0.6 - v * 10 * mm;

  function drawStatic() {
    const pxs = 25 * mm;
    for (let row = 0; row < 3; row++) {
      ctx.beginPath();
      for (let px = 0; px <= W; px += 0.5) {
        const yy = y(row, leads[row](px / pxs));
        px === 0 ? ctx.moveTo(px, yy) : ctx.lineTo(px, yy);
      }
      ctx.stroke();
    }
  }

  function step(now) {
    raf = requestAnimationFrame(step);
    const dt = Math.min(0.05, (now - prev) / 1000 || 0);
    prev = now;
    const pxs = 25 * mm;
    let dx = dt * pxs;
    const sub = 0.5;
    while (dx > 0) {
      const d = Math.min(sub, dx);
      dx -= d;
      const nx = x + d;
      t += d / pxs;
      // erase gap ahead of the cursor
      ctx.clearRect(nx, 0, 18, H);
      for (let row = 0; row < 3; row++) {
        const ny = y(row, leads[row](t));
        if (last[row] !== undefined) {
          ctx.beginPath();
          ctx.moveTo(x, last[row]);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
        last[row] = ny;
      }
      x = nx;
      if (x >= W) { x = 0; last = []; ctx.clearRect(0, 0, 18, H); }
      if (t >= nextBeat) {
        nextBeat += RR;
        beat();
      }
    }
  }

  function beat() {
    if (beatIcon) {
      beatIcon.classList.add('is-on');
      setTimeout(() => beatIcon.classList.remove('is-on'), 160);
    }
    onBeat && onBeat();
  }

  // Clock that starts at 03:12:40 and ticks in real time.
  let secs = 0;
  if (clock) {
    const [h, m, s] = clock.textContent.split(':').map(Number);
    secs = h * 3600 + m * 60 + s;
    setInterval(() => {
      secs++;
      const p = (n) => String(n).padStart(2, '0');
      clock.textContent = `${p(Math.floor(secs / 3600) % 24)}:${p(Math.floor(secs / 60) % 60)}:${p(secs % 60)}`;
    }, 1000);
  }

  function start() {
    if (running || reduce) return;
    running = true;
    prev = performance.now();
    raf = requestAnimationFrame(step);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  layout();
  let rw = 0;
  new ResizeObserver(() => {
    const w = box.getBoundingClientRect().width;
    if (Math.abs(w - rw) > 1) { rw = w; layout(); }
  }).observe(box);

  let inView = false;
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    inView ? start() : stop();
  }, { rootMargin: '80px' }).observe(root);
  document.addEventListener('visibilitychange', () => (document.hidden || !inView ? stop() : start()));
  if (reduce && onBeat) onBeat();
}
