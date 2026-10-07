// Builds a self-contained, clickable preview of public/ for a claude.ai
// Artifact: CSS, JS and fonts inlined, links made relative, and signup forms
// switched to preview mode (no backend there, nothing is sent).
// Run after `npm run build`. Output: preview/index.html (page fragment, the
// Artifact adds the document skeleton) + preview/privacy.html (full page).
import { build } from 'esbuild';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const out = join(root, 'preview');

const js = (await build({
  entryPoints: [join(root, 'src/js/main.js')],
  bundle: true, format: 'iife', minify: true, target: ['es2020'], write: false, legalComments: 'none',
})).outputFiles[0].text;
if (/<\/script/i.test(js)) throw new Error('inline JS contains </script>');

const cssName = (await readdir(join(pub, 'assets/css'))).find((f) => f.endsWith('.css'));
let css = await readFile(join(pub, 'assets/css', cssName), 'utf8');
const fonts = [...new Set(css.match(/\/assets\/fonts\/[\w-]+\.woff2/g))];
for (const f of fonts) {
  const b64 = (await readFile(join(pub, f))).toString('base64');
  css = css.split(`url(${f})`).join(`url(data:font/woff2;base64,${b64})`);
}

const bodyOf = (html) => html.slice(html.indexOf('>', html.indexOf('<body')) + 1, html.lastIndexOf('</body>'));
const boot = `<script>window.__HEKG_PREVIEW__=true;document.documentElement.classList.add('js')</script>`;
const forms = (s) => s.replace(/action="\/api\/subscribe\.php"/g, 'action="#"');

await mkdir(out, { recursive: true });

// Main page — fragment: <title> and <style> first, the skeleton wraps the rest.
const index = bodyOf(await readFile(join(pub, 'index.html'), 'utf8'));
const mainLinks = (s) => forms(s)
  .replace(/href="\/#/g, 'href="#')
  .replace(/href="\/"/g, 'href="#case"')
  .replace(/href="\/privacy"/g, 'href="privacy.html"');
await writeFile(join(out, 'index.html'),
  `<title>helloEKG English Edition</title>\n<style>${css}</style>\n${boot}\n${mainLinks(index)}\n<script>${js}</script>\n`);

// Privacy — a second page, served without the skeleton, so it is a full doc.
const privacy = bodyOf(await readFile(join(pub, 'privacy.html'), 'utf8'));
const subLinks = (s) => forms(s)
  .replace(/href="\/#/g, 'href="./#')
  .replace(/href="\/"/g, 'href="./"')
  .replace(/href="\/privacy"/g, 'href="privacy.html"');
await writeFile(join(out, 'privacy.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>helloEKG Privacy Policy</title>
<style>${css}</style>
${boot}
</head>
<body class="page">
${subLinks(privacy)}
<script>${js}</script>
</body>
</html>
`);

const size = (await readFile(join(out, 'index.html'))).length;
console.log(`Preview → preview/index.html (${(size / 1024).toFixed(0)} KB) + preview/privacy.html`);
