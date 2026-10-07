// Renders brand images with headless Chromium: OG image, icons, favicon.
// Run once (or after brand changes): npm run images
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { sinus, dissociated, toPath, NORMAL, CASE } from '../src/js/ecg-synth.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = join(root, 'static');
const IMG = join(S, 'assets/img');
const SIGN = 'M4,50 L18,50 L26,14 L34,86 L40,50 L60,50 L66,14 L74,86 L80,50 L96,50';

const font = async (f) => `data:font/woff2;base64,${(await readFile(join(S, 'assets/fonts', f))).toString('base64')}`;
const faces = async () => `
@font-face{font-family:SG;font-weight:500;src:url(${await font('space-grotesk-500.woff2')})}
@font-face{font-family:SG;font-weight:600;src:url(${await font('space-grotesk-600.woff2')})}
@font-face{font-family:IN;font-weight:400;src:url(${await font('inter-400.woff2')})}
@font-face{font-family:JB;font-weight:400;src:url(${await font('jetbrains-mono-400.woff2')})}`;

// Square app icon: green sign on ink. `pad` = fraction of the side kept clear.
const iconSvg = (size, pad = 0.2, radius = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
<rect width="100" height="100" rx="${radius}" fill="#0B0F14"/>
<g transform="translate(${pad * 100} ${pad * 100}) scale(${1 - 2 * pad})"><path d="${SIGN}" fill="none" stroke="#3EE6A8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g>
</svg>`;

async function main() {
  await mkdir(IMG, { recursive: true });
  // favicon.svg — scales cleanly; thicker stroke for 16px legibility
  await writeFile(join(S, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0B0F14"/><g transform="translate(12 12) scale(.76)"><path d="${SIGN}" fill="none" stroke="#3EE6A8" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></g></svg>\n`);

  const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const shot = async (html, w, h, file) => {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}</style></head><body>${html}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: file, omitBackground: true });
    await page.close();
  };

  await shot(iconSvg(180, 0.16), 180, 180, join(root, 'static/apple-touch-icon.png'));
  await shot(iconSvg(192, 0.16), 192, 192, join(IMG, 'icon-192.png'));
  await shot(iconSvg(512, 0.16), 512, 512, join(IMG, 'icon-512.png'));
  await shot(iconSvg(512, 0.24), 512, 512, join(IMG, 'icon-maskable-512.png'));
  await shot(iconSvg(512, 0.14), 512, 512, join(IMG, 'logo-512.png'));
  await shot(iconSvg(32, 0.1, 22), 32, 32, join(IMG, 'favicon-32.png'));
  await shot(iconSvg(16, 0.06, 22), 16, 16, join(IMG, 'favicon-16.png'));

  // OG image 1200×630 — the case as a hook, in brand form.
  const strip = (fn, sec, mm, h, t0 = 0) => toPath(fn, { seconds: sec, mm, height: h, t0 });
  const ii = strip(dissociated(CASE.III), 6.4, 7.5, 150, 0.1);
  const W = 1200, H = 630;
  const og = `<style>${await faces()}
  .c{width:${W}px;height:${H}px;background:#0B0F14;color:#F2F6F4;position:relative;overflow:hidden;font-family:IN}
  .grid{position:absolute;left:0;right:0;bottom:0;height:230px;background-color:#0C1117;border-top:1px solid #1A222B;
    background-image:linear-gradient(#1A222B 1px,transparent 1px),linear-gradient(90deg,#1A222B 1px,transparent 1px),linear-gradient(rgba(26,34,43,.45) 1px,transparent 1px),linear-gradient(90deg,rgba(26,34,43,.45) 1px,transparent 1px);
    background-size:37.5px 37.5px,37.5px 37.5px,7.5px 7.5px,7.5px 7.5px}
  .grid svg{position:absolute;left:0;top:30px}
  .logo{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:14px;font:500 30px/1 SG;letter-spacing:-.015em}
  .logo b{font-weight:600}
  .k{position:absolute;left:64px;top:130px;font:400 15px/1 JB;letter-spacing:.16em;color:#3EE6A8;text-transform:uppercase}
  h1{position:absolute;left:64px;top:162px;margin:0;font:500 64px/1.04 SG;letter-spacing:-.03em;width:900px}
  h1 span{color:#8A97A0}
  .hr{position:absolute;right:64px;top:118px;text-align:right}
  .hr .l{font:400 14px/1 JB;letter-spacing:.16em;color:#5C6870}
  .hr .v{font:600 120px/1 SG;color:#3EE6A8;letter-spacing:-.04em;margin-top:8px}
  .lead{position:absolute;right:64px;top:62px;font:400 14px/1 JB;letter-spacing:.16em;color:#5C6870;text-transform:uppercase}
  .lbl{position:absolute;left:24px;top:16px;font:400 14px/1 JB;color:#3EE6A8;letter-spacing:.08em}
  </style>
  <div class="c">
    <div class="logo"><svg viewBox="0 0 100 100" width="40" height="40"><path d="${SIGN}" fill="none" stroke="#3EE6A8" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg><span>hello<b>EKG</b></span></div>
    <div class="lead">Online ECG course</div>
    <div class="k">Case 01 · 03:12 · Emergency department</div>
    <h1>Mark, 58. Courier.<br><span>Heart rate 40.</span><br>Where is the block?</h1>
    <div class="hr"><div class="l">HR</div><div class="v">40</div></div>
    <div class="grid"><span class="lbl">III</span><svg width="${ii.width}" height="${ii.height}" viewBox="0 0 ${ii.width} ${ii.height}"><path d="${ii.d}" fill="none" stroke="#3EE6A8" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg></div>
  </div>`;
  await shot(og, W, H, join(IMG, 'og-image.png'));
  await browser.close();

  // favicon.ico (16 + 32) via Pillow
  execFileSync('python3', ['-I', '-c', `
import sys
from PIL import Image
a=Image.open(sys.argv[1]).convert('RGBA'); b=Image.open(sys.argv[2]).convert('RGBA')
a.save(sys.argv[3], format='ICO', sizes=[(32,32),(16,16)], append_images=[b])
`, join(IMG, 'favicon-32.png'), join(IMG, 'favicon-16.png'), join(S, 'favicon.ico')]);
  console.log('Images rendered.');
}

main().catch((e) => { console.error(e); process.exit(1); });
