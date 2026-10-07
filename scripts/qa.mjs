// Visual + functional smoke test against a local PHP server:
//   npm run serve   (in another terminal)   then   npm run qa
// Saves screenshots to qa/ and fails on console errors.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const base = process.env.QA_URL || 'http://127.0.0.1:8080';
const outDir = process.env.QA_OUT || 'qa';
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined, args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const errors = [];

for (const [name, w, h] of [['desktop', 1440, 900], ['tablet', 820, 1180], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: name === 'mobile' ? 2 : 1 });
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outDir}/${name}-hero.png` });
  // Answer the case (wrong first option) and capture the explanation
  await page.click('[data-case] .opt[data-i="0"]');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${outDir}/${name}-case-answered.png` });
  // Scroll through to trigger reveals, then full page
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += h / 2) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(160); }
  // Challenge: answer first question
  await page.evaluate(() => document.querySelector('#challenge').scrollIntoView());
  await page.waitForTimeout(400);
  await page.click('.q.is-current .opt[data-i="1"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${outDir}/${name}-challenge.png` });
  await page.screenshot({ path: `${outDir}/${name}-full.png`, fullPage: true });
  await page.close();
}
await browser.close();
if (errors.length) { console.error('Console errors:\n' + errors.join('\n')); process.exit(1); }
console.log(`QA screenshots in ${outDir}/ — no console errors.`);
