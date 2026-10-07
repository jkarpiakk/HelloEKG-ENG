// Gaussian-sum ECG model shared by the browser (live monitor) and the build
// (static SVG strips). Time in seconds, amplitude in millivolts.
// Morphology is schematic but clinically honest: correct intervals, axes,
// ST deviations and AV relationships.

const g = (t, mu, sigma, a) => a * Math.exp(-((t - mu) * (t - mu)) / (2 * sigma * sigma));
const sig = (x) => 1 / (1 + Math.exp(-x));

// One P wave, t relative to P onset.
export function pWave(t, amp, width = 1) {
  if (t < -0.05 || t > 0.2) return 0;
  return g(t, 0.05 * width, 0.022 * width, amp);
}

// One QRS–ST–T complex, t relative to QRS onset.
export function qrst(t, L, qrsWidth = 1) {
  if (t < -0.05 || t > 0.7) return 0;
  const w = qrsWidth;
  let v = 0;
  v += g(t, 0.012 * w, 0.007 * w, L.q || 0);
  v += g(t, 0.038 * w, 0.011 * w, L.r || 0);
  v += g(t, 0.066 * w, 0.010 * w, L.s || 0);
  if (L.r2) v += g(t, 0.095 * w, 0.014 * w, L.r2); // R′ (bundle branch block)
  const end = 0.085 * w;
  const st = L.st || 0;
  const tp = (L.tp || 0.28) + 0.05 * (w - 1); // T peak; QT ≈ tp + 2.4·tw
  if (st) {
    // J point already shifted, then a slow ramp that merges into the T wave
    const ramp = 0.7 + 0.3 * Math.min(1, Math.max(0, (t - end) / (tp - end)));
    v += st * ramp * sig((t - end) / 0.005) * (1 - sig((t - (tp + 0.06)) / 0.03));
  }
  v += g(t, tp, L.tw || 0.045, L.t || 0);
  if (L.u) v += g(t, tp + 0.2, 0.04, L.u);
  return v;
}

// Normal sinus morphology for the 12 standard leads.
export const NORMAL = {
  I: { p: 0.1, q: -0.05, r: 0.7, s: -0.1, t: 0.25 },
  II: { p: 0.15, q: -0.05, r: 1.1, s: -0.15, t: 0.35 },
  III: { p: 0.05, q: -0.03, r: 0.45, s: -0.15, t: 0.12 },
  aVR: { p: -0.12, q: 0, r: 0.1, s: -0.8, t: -0.28 },
  aVL: { p: 0.03, q: -0.05, r: 0.4, s: -0.25, t: 0.1 },
  aVF: { p: 0.1, q: -0.04, r: 0.75, s: -0.15, t: 0.22 },
  V1: { p: 0.07, q: 0, r: 0.2, s: -1.0, t: 0.06 },
  V2: { p: 0.08, q: 0, r: 0.4, s: -1.4, t: 0.45 },
  V3: { p: 0.08, q: 0, r: 0.8, s: -0.9, t: 0.5 },
  V4: { p: 0.1, q: 0, r: 1.3, s: -0.5, t: 0.45 },
  V5: { p: 0.1, q: -0.05, r: 1.3, s: -0.2, t: 0.35 },
  V6: { p: 0.1, q: -0.05, r: 1.0, s: -0.1, t: 0.3 },
};

// Case 01 — inferior STEMI (RCA) with complete heart block, junctional escape.
// QT is longer at 40/min, so the T peak sits later.
export const CASE = {
  II: { p: 0.15, q: -0.08, r: 0.85, s: -0.06, st: 0.25, t: 0.3, tp: 0.3, tw: 0.065 },
  III: { p: 0.1, q: -0.16, r: 0.6, s: -0.03, st: 0.35, t: 0.4, tp: 0.3, tw: 0.065 },
  aVL: { p: 0.03, q: 0, r: 0.3, s: -0.3, st: -0.2, t: -0.18, tp: 0.3, tw: 0.065 },
};

// Sinus rhythm: returns v(t) for a lead at a heart rate, PR in seconds.
export function sinus(L, { hr = 72, pr = 0.16, qrsWidth = 1 } = {}) {
  const rr = 60 / hr;
  return (t) => {
    const k = Math.floor(t / rr);
    let v = 0;
    for (let j = k - 1; j <= k + 1; j++) {
      const qrsOn = j * rr + pr;
      v += pWave(t - j * rr, L.p, 1) + qrst(t - qrsOn, L, qrsWidth);
    }
    return v;
  };
}

// Complete heart block: independent atrial and ventricular clocks.
export function dissociated(L, { atrial = 88, ventricular = 40, offset = 0.37 } = {}) {
  const pp = 60 / atrial;
  const rr = 60 / ventricular;
  return (t) => {
    let v = 0;
    const kp = Math.floor(t / pp);
    for (let j = kp - 1; j <= kp + 1; j++) v += pWave(t - j * pp, L.p, 1);
    const kr = Math.floor((t - offset) / rr);
    for (let j = kr - 1; j <= kr + 1; j++) v += qrst(t - (j * rr + offset), L, 1);
    return v;
  };
}

// Mobitz I (Wenckebach) 4:3 — PR 0.20 → 0.32 → 0.38, then a dropped beat.
export function wenckebach(L, { atrial = 80 } = {}) {
  const pp = 60 / atrial;
  const prs = [0.2, 0.32, 0.38, null];
  return (t) => {
    let v = 0;
    const k = Math.floor(t / pp);
    for (let j = k - 2; j <= k + 1; j++) {
      const pOn = j * pp;
      v += pWave(t - pOn, L.p, 1);
      const pr = prs[((j % 4) + 4) % 4];
      if (pr !== null) v += qrst(t - (pOn + pr), L, 1);
    }
    return v;
  };
}

// Atrial flutter with 2:1 conduction — sawtooth F waves at 300/min.
export function flutter(L, { atrial = 300, ratio = 2 } = {}) {
  const ff = 60 / atrial;
  return (t) => {
    const ph = ((t % ff) + ff) % ff / ff;
    // negative sawtooth typical of inferior leads
    let v = -0.18 * (ph < 0.75 ? ph / 0.75 : (1 - ph) / 0.25) + 0.09;
    const rr = ff * ratio;
    const k = Math.floor(t / rr);
    for (let j = k - 1; j <= k + 1; j++) v += qrst(t - (j * rr + 0.14), { ...L, p: 0 }, 1);
    return v;
  };
}

// Sample a signal into an SVG path. mm: px per millimetre (25 mm/s, 10 mm/mV).
export function toPath(fn, { seconds, mm = 4, height = 60, t0 = 0, step = 1 } = {}) {
  const pxPerSec = 25 * mm;
  const pxPerMv = 10 * mm;
  const mid = height / 2;
  const w = seconds * pxPerSec;
  let d = '';
  for (let x = 0; x <= w; x += step) {
    const y = mid - fn(t0 + x / pxPerSec) * pxPerMv;
    d += (x === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
  }
  return { d, width: w, height };
}
