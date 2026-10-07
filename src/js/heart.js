// Particle heart — the brand-book hero, rewritten on raw WebGL (no three.js,
// ~4 KB instead of ~150 KB). Geometry follows the brand reference (procedural
// ventricles, atria and aortic arch); swap in points sampled from an
// anatomical .glb by replacing buildPoints().
// Colours: apex #175A42 → base #3EE6A8, aorta #66F2C4. Rotation 0.32 rad/s.
// The beat is driven from outside (synchronised with the monitor's QRS).

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const C_DARK = hex('#175A42'), C_MID = hex('#2BB380'), C_LIGHT = hex('#3EE6A8'), C_AORTA = hex('#66F2C4');
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function buildPoints(n) {
  const k = n / 4920;
  const P = [], C = [];
  const jit = () => (Math.random() - 0.5) * 0.045;
  const push = (x, y, z, c) => { P.push(x + jit(), y + jit(), z + jit()); C.push(c[0], c[1], c[2]); };
  const body = (y) => lerp(lerp(C_DARK, C_LIGHT, Math.max(0, Math.min(1, (y + 1) / 1.7))), C_MID, Math.random() * 0.3);
  let i, u, a, r, x, y, z;
  for (i = 0; i < 2100 * k; i++) { // left ventricle
    u = Math.random(); a = Math.random() * Math.PI * 2;
    y = 0.5 - 1.4 * u;
    r = 0.72 * Math.pow(1 - u, 0.55) * (1 + 0.08 * Math.sin(a * 2));
    x = Math.cos(a) * r - 0.3 * u + 0.12; z = Math.sin(a) * r * 0.8;
    push(x, y, z, body(y));
  }
  for (i = 0; i < 900 * k; i++) { // right ventricle
    u = Math.random() * 0.72; a = Math.random() * Math.PI * 2;
    y = 0.42 - 1.1 * u;
    r = 0.44 * Math.pow(1 - u / 0.72, 0.5);
    x = 0.52 + Math.cos(a) * r - 0.18 * u; z = 0.12 + Math.sin(a) * r * 0.75;
    push(x, y, z, body(y));
  }
  const blob = (cx, cy, cz, rx, ry, rz, m) => {
    for (let j = 0; j < m * k; j++) {
      const th = Math.acos(2 * Math.random() - 1), ph = Math.random() * Math.PI * 2;
      push(cx + Math.sin(th) * Math.cos(ph) * rx, cy + Math.cos(th) * ry, cz + Math.sin(th) * Math.sin(ph) * rz, body(cy));
    }
  };
  blob(-0.18, 0.55, -0.18, 0.34, 0.28, 0.3, 420); // left atrium
  blob(0.42, 0.5, -0.05, 0.3, 0.24, 0.26, 350);   // right atrium
  blob(-0.05, 0.62, 0.22, 0.22, 0.18, 0.18, 200); // outflow
  // Aortic arch — Catmull-Rom through brand control points
  const cp = [[0.02, 0.55, 0], [0.06, 0.95, 0.02], [-0.08, 1.22, -0.02], [-0.42, 1.28, -0.08], [-0.66, 1.05, -0.12], [-0.72, 0.7, -0.14]];
  const cr = (p0, p1, p2, p3, s) => p1.map((_, d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * s + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * s * s + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * s * s * s));
  const pt = (t) => {
    const n = cp.length - 1, f = t * n, i = Math.min(n - 1, Math.floor(f)), s = f - i;
    const g = (j) => cp[Math.max(0, Math.min(n, j))];
    return cr(g(i - 1), g(i), g(i + 1), g(i + 2), s);
  };
  for (i = 0; i < 950 * k; i++) {
    const t = Math.random();
    const p = pt(t), q = pt(Math.min(1, t + 0.01)), o = pt(Math.max(0, t - 0.01));
    const tan = q.map((v, d) => v - o[d]);
    const tl = Math.hypot(...tan) || 1;
    const T = tan.map((v) => v / tl);
    const up = Math.abs(T[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const nrm = (v) => { const l = Math.hypot(...v) || 1; return v.map((c) => c / l); };
    const n1 = nrm(cross(T, up)), n2 = nrm(cross(T, n1));
    a = Math.random() * Math.PI * 2;
    const rr = 0.13 * (1 - 0.25 * t);
    const c = lerp(C_AORTA, C_MID, Math.random() * 0.4);
    push(p[0] + (n1[0] * Math.cos(a) + n2[0] * Math.sin(a)) * rr, p[1] + (n1[1] * Math.cos(a) + n2[1] * Math.sin(a)) * rr, p[2] + (n1[2] * Math.cos(a) + n2[2] * Math.sin(a)) * rr, c);
  }
  return { P: new Float32Array(P), C: new Float32Array(C) };
}

const VS = `
attribute vec3 aPos; attribute vec3 aCol;
uniform float uRotY, uScale, uHalfH, uSize;
varying vec3 vCol; varying float vDepth;
void main(){
  // brand transform: tilt (rot.z -0.18), drop 0.12, scale, spin around Y
  float cz = cos(-0.18), sz = sin(-0.18);
  vec3 p = vec3(aPos.x * cz - aPos.y * sz, aPos.x * sz + aPos.y * cz, aPos.z);
  p.y -= 0.12;
  p *= uScale;
  float cy = cos(uRotY), sy = sin(uRotY);
  p = vec3(p.x * cy + p.z * sy, p.y, -p.x * sy + p.z * cy);
  // camera at (0, 0.15, 4.6), fov 38°
  float zc = 4.6 - p.z;
  float f = 2.9042;
  gl_Position = vec4(f * p.x / zc, f * (p.y - 0.15) / zc, 0.0, 1.0);
  gl_PointSize = uSize * uHalfH / zc;
  vCol = aCol; vDepth = clamp((p.z + 1.2) / 2.4, 0.0, 1.0);
}`;
const FS = `
precision mediump float;
varying vec3 vCol; varying float vDepth;
void main(){
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float a = 0.95 * smoothstep(0.25, 0.1, r) * (0.62 + 0.38 * vDepth);
  gl_FragColor = vec4(vCol, a);
}`;

export function mountHeart(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
  if (!gl) return null;
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const small = Math.min(innerWidth, innerHeight) < 700;
  const { P, C } = buildPoints(small ? 3600 : 8200);
  const buf = (data, name) => {
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  };
  buf(P, 'aPos');
  buf(C, 'aCol');
  const count = P.length / 3;
  const U = (n) => gl.getUniformLocation(prog, n);
  const uRotY = U('uRotY'), uScale = U('uScale'), uHalfH = U('uHalfH'), uSize = U('uSize');
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastBeat = -10, raf = 0, running = false;
  const t0 = performance.now();

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(uHalfH, canvas.height / 2);
    gl.uniform1f(uSize, 0.03);
  }

  // Two-phase contraction from the brand book: +6% then +3.5%.
  const envelope = (s) => Math.exp(-(((s - 0.1) / 0.042) ** 2)) * 0.06 + Math.exp(-(((s - 0.28) / 0.058) ** 2)) * 0.035;

  function frame(now) {
    const t = (now - t0) / 1000;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uRotY, reduce ? 0.4 : t * 0.32);
    gl.uniform1f(uScale, 1.18 * (1 + (reduce ? 0 : envelope(t - lastBeat))));
    gl.drawArrays(gl.POINTS, 0, count);
    if (running) raf = requestAnimationFrame(frame);
  }

  size();
  new ResizeObserver(size).observe(canvas);
  const start = () => { if (!running && !reduce) { running = true; raf = requestAnimationFrame(frame); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  let inView = false;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? start() : stop(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => (document.hidden || !inView ? stop() : start()));
  if (reduce) requestAnimationFrame(frame);
  canvas.classList.add('is-ready');

  return {
    // QRS → mechanical systole ~50 ms later
    beat() { lastBeat = (performance.now() - t0) / 1000 + 0.05; },
  };
}
