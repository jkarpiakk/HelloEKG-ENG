// Pings IndexNow (Bing, Yandex, Seznam, Naver…) after a deploy so changed
// URLs are recrawled within minutes. Bing's index also feeds ChatGPT search
// and Copilot. Usage: npm run indexnow
import cfg from '../site.config.mjs';

const host = new URL(cfg.origin).host;
const urlList = [`${cfg.origin}/`, `${cfg.origin}/privacy`, `${cfg.origin}/llms.txt`];
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: cfg.indexNowKey, keyLocation: `${cfg.origin}/${cfg.indexNowKey}.txt`, urlList }),
});
console.log(`IndexNow: HTTP ${res.status}${res.status === 200 || res.status === 202 ? ' — accepted' : ''}`);
