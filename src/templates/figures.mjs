// Static SVG figures rendered at build time from the shared ECG model.
import { sinus, wenckebach, flutter, toPath, NORMAL, pWave, qrst } from '../js/ecg-synth.js';

// One normal beat (lead II) split into the five segments of the method story.
export function complexFigure() {
  const L = NORMAL.II;
  const beat = (t) => pWave(t, L.p) + qrst(t - 0.16, L);
  const mm = 14; // px per mm → 350 px/s, 140 px/mV
  const pxs = 25 * mm;
  const H = 252;
  const base = 170;
  const t0 = -0.12;
  const seg = (from, to) => {
    let d = '';
    for (let t = from; t <= to + 1e-9; t += 0.003) {
      const x = (t - t0) * pxs;
      const y = base - beat(t) * 10 * mm;
      d += (d ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  };
  const W = (0.78 - t0) * pxs;
  const parts = [
    ['pre', -0.12, 0],
    ['p', 0, 0.11],
    ['pr', 0.11, 0.16],
    ['qrs', 0.16, 0.25],
    ['st', 0.25, 0.35],
    ['t', 0.35, 0.62],
    ['post', 0.62, 0.78],
  ];
  const x = (t) => ((t - t0) * pxs).toFixed(1);
  const brackets = [
    ['p', 0, 0.11, 'P'],
    ['pr', 0, 0.16, 'PR'],
    ['qrs', 0.16, 0.25, 'QRS'],
    ['st', 0.25, 0.35, 'ST'],
    ['t', 0.16, 0.62, 'QT'],
  ];
  return `<svg class="complex" viewBox="0 0 ${W.toFixed(0)} ${H}" role="img" aria-label="One ECG complex: P wave, PR interval, QRS complex, ST segment and T wave">
  <g class="complex__grid">${Array.from({ length: Math.floor(W / (5 * mm)) + 1 }, (_, i) => `<line x1="${i * 5 * mm}" y1="0" x2="${i * 5 * mm}" y2="${H}"/>`).join('')}${Array.from({ length: Math.floor(H / (5 * mm)) + 1 }, (_, i) => `<line x1="0" y1="${i * 5 * mm}" x2="${W.toFixed(0)}" y2="${i * 5 * mm}"/>`).join('')}</g>
  ${parts.map(([k, a, b]) => `<path class="complex__seg" data-seg="${k}" d="${seg(a, b)}"/>`).join('\n  ')}
  ${brackets.map(([k, a, b, label], i) => {
    const y = 202 + (k === 't' ? 26 : k === 'pr' ? 13 : 0);
    return `<g class="complex__br" data-seg="${k}"><path d="M${x(a)} ${y - 5}V${y}H${x(b)}V${y - 5}"/><text x="${((+x(a) + +x(b)) / 2).toFixed(1)}" y="${y + 13}">${label}</text></g>`;
  }).join('\n  ')}
</svg>`;
}

// Schematic conduction system, frontal view (atria top, apex bottom right).
export function conductionFigure() {
  return `<svg class="cs" viewBox="0 0 370 360" role="img" aria-label="Schematic of the cardiac conduction system: sinus node, AV node, bundle of His, bundle branches and Purkinje fibres">
  <path class="cs__atria" d="M78,170 C72,120 85,60 145,42 C165,38 180,46 188,56 C215,44 255,58 272,98 C285,118 292,138 294,156 C230,148 140,158 78,170 Z"/>
  <path class="cs__vent" d="M78,170 C140,158 230,148 294,156 C306,200 300,250 270,292 C252,316 236,330 226,338 C180,326 128,298 100,258 C84,232 76,200 78,170 Z"/>
  <path class="cs__septum" d="M186,162 C196,220 210,290 226,338"/>
  <path class="cs__septum" d="M188,58 C186,100 184,140 186,162"/>
  <g class="cs__path cs-sa">
    <path d="M114,74 C132,110 156,140 182,164"/>
    <path d="M114,74 C150,64 206,70 250,100"/>
    <path d="M114,74 C104,108 98,138 96,160"/>
  </g>
  <g class="cs__path cs-his">
    <path d="M184,168 L189,194"/>
    <path d="M189,194 C186,240 192,286 206,322"/>
    <path d="M189,194 C208,232 230,266 252,292"/>
    <path d="M198,212 C232,208 264,220 286,242"/>
    <path class="cs__purk" d="M206,322 C176,312 138,288 112,250"/>
    <path class="cs__purk" d="M252,292 C246,310 236,326 226,336"/>
    <path class="cs__purk" d="M286,242 C294,214 296,190 292,168"/>
  </g>
  <circle class="cs__node cs-sa" cx="114" cy="74" r="7"/>
  <circle class="cs__node cs-av" cx="183" cy="166" r="7"/>
  <g class="cs__labels">
    <text x="24" y="70">SA node</text>
    <text x="214" y="186">AV node</text>
    <text x="300" y="250">Purkinje</text>
    <text x="92" y="300">Bundle branches</text>
  </g>
</svg>`;
}

const GRID = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
];

export function twelveLead() {
  const cells = GRID.flat().map((lead) => {
    const p = toPath(sinus(NORMAL[lead], { hr: 75 }), { seconds: 1.6, mm: 3, height: 84, t0: 0.55 });
    return `<div class="tl__cell" data-lead="${lead}">
      <span class="tl__name">${lead}</span>
      <svg viewBox="0 0 ${p.width} ${p.height}" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${p.d}"/></svg>
    </div>`;
  });
  return `<div class="tl" role="img" aria-label="Standard 12-lead ECG layout: I, aVR, V1, V4; II, aVL, V2, V5; III, aVF, V3, V6">${cells.join('')}</div>`;
}

export function wenckebachStrip() {
  const p = toPath(wenckebach(NORMAL.II), { seconds: 4.6, mm: 4, height: 96, t0: 0.05 });
  return `<svg class="strip" viewBox="0 0 ${p.width} ${p.height}" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false"><path class="strip__trace" d="${p.d}"/><path class="strip__live" d="${p.d}" pathLength="1000"/></svg>`;
}

export function flutterStrip() {
  // 4:1 conduction leaves long runs of sawtooth between QRS complexes.
  const fn = flutter(NORMAL.II, { ratio: 4 });
  const mm = 4;
  const p = toPath(fn, { seconds: 3.2, mm, height: 96, t0: 0 });
  // Hotspot on the trough of a flutter wave well clear of QRS and T.
  const t = 0.75;
  const cx = (t * 25 * mm).toFixed(1);
  const cy = (p.height / 2 - fn(t) * 10 * mm).toFixed(1);
  return `<svg class="strip" viewBox="0 0 ${p.width} ${p.height}" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false"><path class="strip__trace strip__trace--on" d="${p.d}"/><circle class="hotspot" cx="${cx}" cy="${cy}" r="13"/><circle class="hotspot__dot" cx="${cx}" cy="${cy}" r="3"/></svg>`;
}
