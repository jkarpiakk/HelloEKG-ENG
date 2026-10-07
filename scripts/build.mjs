// Builds the static site into public/ — upload that folder to the domain
// root on home.pl. No runtime framework; PHP only for the email endpoint.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { cp, mkdir, rm, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import cfg from '../site.config.mjs';
import heroCase from '../src/content/case.mjs';
import { questions as rawQuestions, categories } from '../src/content/questions.mjs';
import curriculum from '../src/content/curriculum.mjs';
import faq from '../src/content/faq.mjs';
import method from '../src/content/method.mjs';
import leads from '../src/content/leads.mjs';
import { renderIndex } from '../src/templates/index.mjs';
import { renderPrivacy, renderNotFound, renderCheckInbox, renderConfirmed, renderUnsubscribed, renderSignupError } from '../src/templates/pages.mjs';
import { homeSchema } from '../src/templates/schema.mjs';
import { llmsTxt, llmsFull } from '../src/templates/llms.mjs';
import { INLINE_JS_BODY } from '../src/templates/layout.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');

// ── Deterministic option shuffle so correct answers are spread over A–D ──
function seeded(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}
const questions = rawQuestions.map((q) => {
  const rnd = seeded(`hekg:${q.id}`);
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
});

async function main() {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(join(root, 'static'), out, { recursive: true });

  // ── Assets ──
  const js = await build({
    entryPoints: [join(root, 'src/js/main.js')],
    bundle: true, splitting: true, format: 'esm', minify: true, target: ['es2020'],
    outdir: join(out, 'assets/js'), entryNames: '[name].[hash]', chunkNames: '[name].[hash]',
    metafile: true, legalComments: 'none', logLevel: 'warning',
  });
  const css = await build({
    entryPoints: [join(root, 'src/styles/main.css')],
    bundle: true, minify: true, external: ['/assets/*'],
    outdir: join(out, 'assets/css'), entryNames: '[name].[hash]',
    metafile: true, logLevel: 'warning',
  });
  const pick = (meta, entry) => '/' + Object.entries(meta.outputs).find(([, o]) => o.entryPoint && o.entryPoint.endsWith(entry))[0].replace(/^public\//, '');
  const assets = { js: pick(js.metafile, 'src/js/main.js'), css: pick(css.metafile, 'src/styles/main.css') };

  // ── Pages ──
  const page = {
    path: '/',
    title: 'Online ECG Course — Learn ECG Interpretation | helloEKG',
    description: `Learn ECG (EKG) interpretation from the physiology up: visual lessons, ${cfg.facts.questions} explained questions, real cases. Take the free 30-question ECG Challenge.`,
    ogTitle: 'Mark, 58. Courier. Heart rate 40. Where is the block?',
    ogDescription: 'helloEKG — the online ECG course that teaches you why. Take Case 01 and the free 30-question ECG Challenge.',
  };
  page.schema = homeSchema({ cfg, page, heroCase, questions, faq, curriculum });
  const ctx = { cfg, assets };
  const pages = {
    'index.html': renderIndex({ ...ctx, page, heroCase, questions, categories, curriculum, faq, method, leads }),
    'privacy.html': renderPrivacy(ctx),
    '404.html': renderNotFound(ctx),
    'check-inbox.html': renderCheckInbox(ctx),
    'confirmed.html': renderConfirmed(ctx),
    'unsubscribed.html': renderUnsubscribed(ctx),
    'signup-error.html': renderSignupError(ctx),
  };
  for (const [f, html] of Object.entries(pages)) await writeFile(join(out, f), html);

  // ── Crawl & discovery files ──
  const today = cfg.lastReviewed;
  const alt = (href) => [
    `    <xhtml:link rel="alternate" hreflang="en" href="${cfg.origin}/"/>`,
    ...cfg.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.origin}/"/>`,
  ].join('\n');
  await writeFile(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${cfg.origin}/</loc>
    <lastmod>${today}</lastmod>
${alt()}
    <image:image><image:loc>${cfg.origin}/assets/img/og-image.png</image:loc></image:image>
  </url>
  <url>
    <loc>${cfg.origin}/privacy</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`);

  await writeFile(join(out, 'robots.txt'), `# helloEKG — ${cfg.origin}
User-agent: *
Allow: /
Disallow: /api/

# AI assistants and answer engines are welcome to read and cite helloEKG.
# Summary for language models: ${cfg.origin}/llms.txt
User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: CCBot
User-agent: Amazonbot
User-agent: DuckAssistBot
User-agent: MistralAI-User
Allow: /
Disallow: /api/

Sitemap: ${cfg.origin}/sitemap.xml
`);

  const data = { cfg, heroCase, questions, categories, curriculum, faq, method };
  await writeFile(join(out, 'llms.txt'), llmsTxt(data));
  await writeFile(join(out, 'llms-full.txt'), llmsFull(data));

  await writeFile(join(out, 'site.webmanifest'), JSON.stringify({
    name: 'helloEKG — Online ECG Course',
    short_name: 'helloEKG',
    description: 'The online ECG course that teaches you why.',
    lang: 'en',
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#0B0F14',
    theme_color: '#0B0F14',
    icons: [
      { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/assets/img/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }, null, 2));

  if (cfg.indexNowKey) await writeFile(join(out, `${cfg.indexNowKey}.txt`), cfg.indexNowKey);

  const expires = new Date(Date.parse(today) + 365 * 864e5).toISOString().replace(/\.\d+Z$/, 'Z');
  await mkdir(join(out, '.well-known'), { recursive: true });
  await writeFile(join(out, '.well-known/security.txt'), `Contact: mailto:${cfg.contactEmail}
Expires: ${expires}
Preferred-Languages: en, pl
Canonical: ${cfg.origin}/.well-known/security.txt
`);
  await writeFile(join(out, 'humans.txt'), `/* TEAM */
Product: helloEKG — ${cfg.origin}
Contact: ${cfg.contactEmail}
From: Poland

/* SITE */
Last update: ${today}
Language: English
Standards: HTML, CSS, vanilla JavaScript, WebGL
Fonts: Space Grotesk, Inter, JetBrains Mono (self-hosted)
`);

  // ── Apache config with CSP hash of the inline bootstrap script ──
  const sha = createHash('sha256').update(INLINE_JS_BODY).digest('base64');
  const host = new URL(cfg.origin).host;
  await writeFile(join(out, '.htaccess'), htaccess({ host, sha }));

  // ── Report ──
  const files = await listFiles(out);
  console.log(`Built ${files.length} files → public/`);
  console.log(`  js  ${assets.js}\n  css ${assets.css}`);
  const dist = [0, 0, 0, 0];
  questions.forEach((q) => dist[q.answer]++);
  console.log(`  answer spread A/B/C/D: ${dist.join('/')}`);
}

async function listFiles(dir) {
  const res = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) res.push(...(await listFiles(p)));
    else res.push(p);
  }
  return res;
}

function htaccess({ host, sha }) {
  const hostRe = host.replace(/\./g, '\\.');
  return `# helloEKG — Apache configuration (home.pl)
# Generated by scripts/build.mjs — edit there, not here.

Options -Indexes -MultiViews
DirectoryIndex index.html index.php
AddDefaultCharset utf-8
ErrorDocument 404 /404.html

AddType font/woff2 .woff2
AddType application/manifest+json .webmanifest
AddType text/javascript .js
AddCharset utf-8 .txt .xml .css .js .webmanifest .json

<IfModule mod_rewrite.c>
  RewriteEngine On

  # 1. HTTPS + apex domain (www.${host} → ${host}).
  #    If home.pl already forces HTTPS in the panel and you see a redirect
  #    loop, delete the two HTTPS lines below and keep only the www rule.
  RewriteCond %{HTTPS} !=on
  RewriteCond %{HTTP:X-Forwarded-Proto} !=https
  RewriteRule ^ https://${host}%{REQUEST_URI} [R=301,L]
  RewriteCond %{HTTP_HOST} ^www\\.${hostRe}$ [NC]
  RewriteRule ^ https://${host}%{REQUEST_URI} [R=301,L]

  # 2. Clean URLs: /index.html → /, /privacy.html → /privacy
  RewriteCond %{THE_REQUEST} \\s/+index\\.html[\\s?] [NC]
  RewriteRule ^index\\.html$ / [R=301,L]
  RewriteCond %{THE_REQUEST} \\s/+([^.?\\s]+)\\.html[\\s?] [NC]
  RewriteRule ^ /%1 [R=301,L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME}.html -f
  RewriteRule ^(.+?)/?$ $1.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  Header always set Cross-Origin-Opener-Policy "same-origin"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-${sha}'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests"

  # Fingerprinted assets never change → cache for a year.
  <FilesMatch "\\.[0-9A-Z]{8}\\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.(woff2)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
    Header set Access-Control-Allow-Origin "*"
  </FilesMatch>
  <FilesMatch "\\.(png|svg|ico|webmanifest)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <FilesMatch "\\.(html|xml|txt)$">
    Header set Cache-Control "public, max-age=0, must-revalidate"
  </FilesMatch>
  <FilesMatch "^(llms|llms-full)\\.txt$">
    Header set X-Robots-Tag "noindex"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml text/javascript application/javascript application/json application/ld+json application/xml image/svg+xml application/manifest+json
</IfModule>

# Never serve source or tooling files if they are uploaded by mistake.
<FilesMatch "\\.(md|mjs|sh|lock|log|sqlite|bak)$|^(package(-lock)?\\.json|composer\\.(json|lock))$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>
`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
