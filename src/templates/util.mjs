export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const pad2 = (n) => String(n).padStart(2, '0');

// Brand sign: the letter H written as two R waves on an isoelectric line.
export const SIGN_PATH = 'M4,50 L18,50 L26,14 L34,86 L40,50 L60,50 L66,14 L74,86 L80,50 L96,50';

// Separator morphology from the brand book (fixed, never random).
export const LINE_PATH =
  'M0,26 L80,26 L92,20 L104,26 L150,26 L160,6 L170,42 L180,26 L240,26 L258,16 L276,26 L400,26 L412,20 L424,26 L470,26 L480,6 L490,42 L500,26 L560,26 L578,16 L596,26 L720,26 L732,20 L744,26 L790,26 L800,6 L810,42 L820,26 L880,26 L898,16 L916,26 L1040,26 L1052,20 L1064,26 L1110,26 L1120,6 L1130,42 L1140,26 L1200,26';

export function logo({ href = '/', label = 'helloEKG — home' } = {}) {
  return `<a class="logo" href="${href}" aria-label="${esc(label)}">
  <svg class="logo__sign" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <path class="logo__trace" d="${SIGN_PATH}"/>
    <path class="logo__pulse" d="${SIGN_PATH}"/>
  </svg>
  <span class="logo__word">hello<b>EKG</b></span>
</a>`;
}

export function ecgLine(cls = '') {
  return `<div class="ecgline ${cls}" aria-hidden="true">
  <svg viewBox="0 0 1200 44" preserveAspectRatio="none" focusable="false">
    <path class="ecgline__trace" d="${LINE_PATH}"/>
    <path class="ecgline__pulse" d="${LINE_PATH}"/>
  </svg>
</div>`;
}

export const icon = {
  arrow: '<svg class="i" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg class="i" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg class="i" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  plus: '<svg class="i" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  heart: '<svg class="i" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 13.5S2 10 2 5.8A3 3 0 0 1 8 4.4a3 3 0 0 1 6 1.4C14 10 8 13.5 8 13.5z" fill="currentColor"/></svg>',
  instagram: '<svg class="i" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="2" y="2" width="12" height="12" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2.8" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="11.6" cy="4.4" r=".9" fill="currentColor"/></svg>',
};

// Email capture. Works without JS (POST → 303 redirect), enhanced by
// src/js/signup.js (fetch + inline status).
export function signupForm({ id, source, cta = 'Send me the cases', note, compact = false }) {
  return `<form class="signup${compact ? ' signup--compact' : ''}" action="/api/subscribe.php" method="post" data-signup novalidate>
  <div class="signup__row">
    <label class="sr-only" for="${id}">Email address</label>
    <input class="input" id="${id}" type="email" name="email" autocomplete="email" inputmode="email" required maxlength="254" placeholder="you@hospital.org" spellcheck="false" autocapitalize="off">
    <button class="btn btn--primary" type="submit">${esc(cta)}</button>
  </div>
  <input type="hidden" name="source" value="${esc(source)}">
  <input type="hidden" name="score" value="">
  <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
  <p class="signup__note">${note || 'Free. One case a week. Unsubscribe in one click.'} <a href="/privacy">Privacy</a></p>
  <p class="signup__status" role="status" aria-live="polite"></p>
</form>`;
}
