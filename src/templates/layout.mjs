import { esc, logo, icon } from './util.mjs';

// Runs before first paint so reveal animations don't flash. Its SHA-256 is
// whitelisted in the Content-Security-Policy (see scripts/build.mjs).
export const INLINE_JS_BODY = "document.documentElement.classList.add('js')";
const INLINE_JS = `<script>${INLINE_JS_BODY}</script>`;

export function head({ cfg, assets, page }) {
  const url = cfg.origin + page.path;
  const robots = page.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const alt = page.path === '/'
    ? [
        `<link rel="alternate" hreflang="en" href="${cfg.origin}/">`,
        ...cfg.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}">`),
        `<link rel="alternate" hreflang="x-default" href="${cfg.origin}/">`,
      ].join('\n')
    : '';
  const verify = [
    cfg.googleSiteVerification && `<meta name="google-site-verification" content="${esc(cfg.googleSiteVerification)}">`,
    cfg.bingSiteVerification && `<meta name="msvalidate.01" content="${esc(cfg.bingSiteVerification)}">`,
  ].filter(Boolean).join('\n');
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${url}">
${alt}
<meta name="theme-color" content="#0B0F14">
<meta name="color-scheme" content="dark">
<meta name="format-detection" content="telephone=no">
<meta name="author" content="helloEKG">
${verify}
<meta property="og:type" content="website">
<meta property="og:site_name" content="helloEKG">
<meta property="og:locale" content="${cfg.locale}">
${cfg.alternates.map((a) => `<meta property="og:locale:alternate" content="${a.hreflang === 'pl' ? 'pl_PL' : a.hreflang}">`).join('\n')}
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.ogDescription || page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${cfg.origin}/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="helloEKG — the online ECG course that teaches you why">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(page.ogTitle || page.title)}">
<meta name="twitter:description" content="${esc(page.ogDescription || page.description)}">
<meta name="twitter:image" content="${cfg.origin}/assets/img/og-image.png">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/space-grotesk-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
${INLINE_JS}
<link rel="stylesheet" href="${assets.css}">
<script type="module" src="${assets.js}"></script>
${page.schema ? `<script type="application/ld+json">${JSON.stringify(page.schema).replace(/</g, '\\u003c')}</script>` : ''}
</head>`;
}

export function nav({ minimal = false } = {}) {
  const links = minimal
    ? ''
    : `<nav class="nav__links" aria-label="Sections">
      <a href="#case">The case</a>
      <a href="#method">Method</a>
      <a href="#challenge">ECG Challenge</a>
      <a href="#curriculum">Curriculum</a>
      <a href="#faq">FAQ</a>
    </nav>`;
  return `<a class="skip" href="#main">Skip to content</a>
<header class="nav" data-nav>
  <div class="nav__inner wrap">
    ${logo()}
    ${links}
    <div class="nav__end">
      <a class="nav__lang" href="https://helloekg.pl/" hreflang="pl" lang="pl" title="Wersja polska">PL</a>
      <a class="btn btn--ghost btn--sm" href="/#join"><span class="nav__cta-long">Get early access</span><span class="nav__cta-short">Join</span></a>
    </div>
  </div>
</header>`;
}

export function footer({ cfg }) {
  const year = new Date(cfg.lastReviewed).getFullYear();
  return `<footer class="footer">
  <div class="wrap footer__inner">
    <div class="footer__brand">
      ${logo()}
      <p>The online ECG course that teaches you why. Physiology first, pattern second.</p>
    </div>
    <nav class="footer__cols" aria-label="Footer">
      <div>
        <p class="label">Learn</p>
        <a href="/#case">Case 01</a>
        <a href="/#method">The method</a>
        <a href="/#leads">12 leads, 12 cameras</a>
        <a href="/#challenge">ECG Challenge</a>
        <a href="/#curriculum">Curriculum</a>
      </div>
      <div>
        <p class="label">helloEKG</p>
        <a href="/#faq">FAQ</a>
        <a href="/#join">Early access</a>
        <a href="https://helloekg.pl/" hreflang="pl" lang="pl">Polski — helloekg.pl</a>
        <a href="${cfg.instagram}" rel="me noopener" target="_blank">${icon.instagram} Instagram</a>
      </div>
      <div>
        <p class="label">Legal</p>
        <a href="/privacy">Privacy policy</a>
        <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a>
      </div>
    </nav>
  </div>
  <div class="wrap footer__legal">
    <p>Educational content for healthcare professionals and students. It does not replace clinical judgment, local protocols or medical advice.</p>
    <p class="label">© ${year} helloEKG · Last reviewed ${cfg.lastReviewed}</p>
  </div>
</footer>`;
}
