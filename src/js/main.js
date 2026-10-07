import { mountMonitor } from './monitor.js';
import { mountCase, mountChallenge } from './quiz.js';
import { mountSignup } from './signup.js';

// (The `js` class is also set by a tiny hashed inline script in <head> to
// avoid a flash before this deferred module runs.)
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ── Nav: hairline after scroll, active section ───────────────────────────
const navEl = $('[data-nav]');
if (navEl) {
  const onScroll = () => navEl.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const links = new Map($$('.nav__links a').map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const a = links.get(e.target.id);
    if (a && e.isIntersecting) { links.forEach((l) => l.removeAttribute('aria-current')); a.setAttribute('aria-current', 'true'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); s && io.observe(s); });
}

// ── Reveal on scroll (staggered within a parent) ─────────────────────────
// Elements already on screen at load stay put; only the rest animate in.
const revealIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.remove('is-pending');
  revealIO.unobserve(e.target);
}), { rootMargin: '0px 0px -8% 0px' });
if (!reduce) {
  $$('[data-reveal]').forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.92) return;
    const sibs = $$(':scope > [data-reveal]', el.parentElement);
    const i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 6) * 0.08}s`);
    el.classList.add('is-pending');
    revealIO.observe(el);
  });
}

// ── Case 01: monitor + heart in sync ─────────────────────────────────────
let heart = null;
const monitorEl = $('[data-monitor]');
if (monitorEl) mountMonitor(monitorEl, { onBeat: () => heart && heart.beat() });
const heartCanvas = $('[data-heart]');
if (heartCanvas && getComputedStyle(heartCanvas.parentElement).display !== 'none') {
  const load = () => import('./heart.js').then((m) => { heart = m.mountHeart(heartCanvas); });
  'requestIdleCallback' in window ? requestIdleCallback(load, { timeout: 1200 }) : setTimeout(load, 300);
}
const caseEl = $('[data-case]');
if (caseEl) mountCase(caseEl);

// ── Statement: words light up with scroll ────────────────────────────────
const words = $('[data-words]');
if (words && !reduce) {
  const ws = $$('.w', words);
  let ticking = false;
  const paint = () => {
    ticking = false;
    const r = words.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
    const n = Math.round(p * ws.length);
    ws.forEach((w, i) => w.classList.toggle('is-lit', i < n));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();
} else if (words) {
  $$('.w', words).forEach((w) => w.classList.add('is-lit'));
}

// ── Counters ─────────────────────────────────────────────────────────────
const countIO = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  countIO.unobserve(e.target);
  const el = e.target;
  const to = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  if (reduce) return;
  const t0 = performance.now();
  const dur = 1400;
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const v = Math.round(to * (1 - Math.pow(1 - k, 4)));
    el.textContent = v + (k === 1 ? suffix : '');
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), { threshold: 0.6 });
$$('[data-count]').forEach((el) => countIO.observe(el));

// ── Method: sticky visual follows the active step ────────────────────────
const visual = $('[data-method-visual]');
if (visual) {
  const steps = $$('.step');
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    steps.forEach((s) => s.classList.toggle('is-active', s === e.target));
    visual.dataset.step = e.target.dataset.step;
  }), { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach((s) => io.observe(s));
  steps[0] && steps[0].classList.add('is-active');
}

// ── 12 leads ─────────────────────────────────────────────────────────────
const terr = $('[data-territories]');
if (terr) {
  const cells = new Map($$('.tl__cell').map((c) => [c.dataset.lead, c]));
  const items = $$('.territory__item');
  const select = (btn) => {
    $$('.chip', terr).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const on = btn.dataset.leads.split(' ');
    const rc = (btn.dataset.recip || '').split(' ').filter(Boolean);
    cells.forEach((c, lead) => {
      c.classList.toggle('is-on', on.includes(lead));
      c.classList.toggle('is-rc', rc.includes(lead));
    });
    items.forEach((it) => (it.hidden = it.dataset.for !== btn.dataset.territory));
  };
  $$('.chip', terr).forEach((b) => b.addEventListener('click', () => select(b)));
  select($('.chip', terr));
}

// ── Challenge & signup ───────────────────────────────────────────────────
const quizEl = $('[data-quiz]');
if (quizEl) mountChallenge(quizEl);
mountSignup();
