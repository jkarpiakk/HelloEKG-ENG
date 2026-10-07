# helloEKG — landing EN (helloekg.com)

Statyczny landing anglojęzyczny helloEKG, zoptymalizowany pod Google, Bing i wyszukiwanie w LLM-ach. Hosting: **home.pl** (Apache + PHP). Folder do wgrania na serwer: **`public/`**.

- Hook: **Case 01** — kurier Mark, 58 l., zawał ściany dolnej (RCA) z blokiem całkowitym na poziomie węzła AV, na żywym kardiomonitorze (25 mm/s, 10 mm/mV) zsynchronizowanym z sercem 3D bijącym w jego rytmie 40/min.
- **ECG Challenge**: 30 pytań (fizjologia, rytmy, przewodzenie, niedokrwienie, elektrolity i leki, urządzenia i „mimiki”) + case — razem 31, każde z mechanizmem i „perełką z dyżuru”.
- Metoda (sticky scroll: układ bodźcoprzewodzący ↔ zespół PQRST), 12 odprowadzeń = 12 kamer (interaktywne terytoria wieńcowe), anatomia lekcji, program 7 modułów / 33 lekcji, FAQ.
- Zapis na listę w 5 miejscach (po case, w połowie quizu, po wyniku, finał, strony pomocnicze) — **double opt-in**, bez zewnętrznych usług.

## Struktura

```
site.config.mjs          ← domena, e-mail, administrator danych, weryfikacje GSC/Bing, liczby kursu
src/content/*.mjs        ← CAŁA treść: case, 30 pytań, metoda, terytoria, program, FAQ
src/templates/*.mjs      ← HTML, JSON-LD, llms.txt
src/styles/main.css      ← system wizualny wg brandbooka v1.1
src/js/*.js              ← monitor EKG, serce WebGL, quiz, zapis (vanilla JS, ~18 KB)
static/                  ← kopiowane 1:1 (PHP API, fonty, ikony, OG image)
scripts/build.mjs        ← generuje public/ (+ sitemap, robots, llms.txt, .htaccess z CSP)
public/                  ← GOTOWY BUILD do wgrania na home.pl
```

Zmiana treści: edytujesz `src/content/*.mjs` → `npm run build` → wgrywasz `public/`.

```bash
npm install
npm run build        # → public/
npm run serve        # podgląd: http://127.0.0.1:8080 (PHP built-in)
npm run qa           # zrzuty 390/820/1440 + błędy konsoli (przy włączonym serve)
npm run images       # ponowny render OG image i ikon
```

## Wdrożenie na home.pl

1. **Domena**: w panelu home.pl podepnij `helloekg.com` (i `www`) pod osobny katalog, np. `/helloekg.com`. Włącz certyfikat SSL (Let’s Encrypt jest darmowy w panelu).
2. **PHP**: ustaw dla katalogu PHP **8.1+** (panel → Serwery WWW → Konfiguracja PHP).
3. **Skrzynka**: załóż `hello@helloekg.com` (panel → Poczta). Z niej wychodzą maile potwierdzające — bez niej home.pl może je odrzucać. Dodaj rekordy SPF/DKIM (home.pl ma je jako gotowe przełączniki w strefie DNS).
4. **Wgranie**: przeciągnij **zawartość** `public/` do katalogu domeny przez FTP (FileZilla) albo:
   ```bash
   FTP_HOST=serwerXXXX.home.pl FTP_USER=… FTP_PASS=… FTP_DIR=/helloekg.com ./scripts/deploy-ftp.sh
   ```
   Pliki z kropką (`.htaccess`, `.well-known/`) muszą trafić na serwer — w FileZilli włącz „Pokaż ukryte pliki”.
5. **Opcjonalnie** `api/config.php` na serwerze (wzór: `api/config.sample.php`): powiadomienia o nowych zapisach (`notify_email`) i klucz eksportu listy (`export_key`).
6. **Test**: zapisz się własnym adresem → mail → klik → `/confirmed`. Sprawdź `https://helloekg.com/api/_data/` → musi być **403**.
7. Jeśli po wgraniu jest pętla przekierowań: usuń w `.htaccess` dwie linie HTTPS (sekcja 1) i włącz „Wymuszaj HTTPS” w panelu.

Lista mailowa: pliki w `api/_data/` (chronione `.htaccess` + strażnikiem PHP). Eksport do MailerLite/Brevo/Mailchimp:
```bash
curl -H "X-Export-Key: <export_key>" https://helloekg.com/api/export.php > lista.csv
```
CSV zawiera gotowy link wypisu dla każdego adresu (obsługuje też one-click RFC 8058).

## Google Search Console (po wgraniu strony)

Najlepiej **usługa typu „Domena”** — obejmuje http/https/www naraz:

1. [search.google.com/search-console](https://search.google.com/search-console) → Dodaj usługę → **Domena** → `helloekg.com`.
2. Google pokaże rekord TXT `google-site-verification=…`. W home.pl: panel → Domeny → helloekg.com → **Strefa DNS** → Dodaj rekord **TXT**, host `@`, wartość jak wyżej. Odczekaj kilka–kilkadziesiąt minut → **Zweryfikuj**.
3. (Alternatywa: usługa „Prefiks URL” `https://helloekg.com/` → metoda „Tag HTML” → wklej sam token do `googleSiteVerification` w `site.config.mjs` → `npm run build` → wgraj.)
4. **Mapy witryn** → dodaj `sitemap.xml`.
5. **Sprawdzanie adresu URL** → `https://helloekg.com/` → **Poproś o zindeksowanie**.
6. Po kilku dniach: Ulepszenia → sprawdź wykryte dane strukturalne (Course, Quiz, FAQ, Organization).

**Bing Webmaster Tools** ([bing.com/webmasters](https://www.bing.com/webmasters)) → „Import from Google Search Console” (1 klik). Bing zasila ChatGPT Search i Copilota. Po każdym wdrożeniu: `npm run indexnow`.

## hreflang — do wklejenia na helloekg.pl

Polska strona musi odwzajemnić powiązanie, inaczej Google zignoruje hreflang. W `<head>` strony głównej helloekg.pl:

```html
<link rel="alternate" hreflang="pl" href="https://helloekg.pl/">
<link rel="alternate" hreflang="en" href="https://helloekg.com/">
<link rel="alternate" hreflang="x-default" href="https://helloekg.com/">
```

## Co jest zrobione pod SEO / LLM

- Tytuł 55 zn., opis < 155 zn., jedno H1 z frazą „online ECG course”, ECG i EKG w treści (US/UK).
- JSON-LD `@graph`: Organization, WebSite, MedicalWebPage (lastReviewed, audience), Course (syllabus 7 modułów), **Quiz z 31 pytaniami i odpowiedziami**, FAQPage.
- Cała treść quizu w HTML (indeksowalna bez JS), deep linki do pytań `/#q-wellens`.
- `llms.txt` + `llms-full.txt` (pełny tekst pytań i wyjaśnień w Markdown) — do cytowania przez ChatGPT/Claude/Perplexity; `robots.txt` jawnie wpuszcza boty AI.
- `sitemap.xml` z hreflang i obrazem, kanoniczne URL-e, czyste adresy (`/privacy`), 301 www→apex i http→https.
- OG/Twitter card 1200×630, favicony, manifest, `security.txt`, `humans.txt`, IndexNow.
- Wydajność: zero frameworków, fonty self-hosted (latin + symbole kliniczne), serce WebGL bez three.js i ładowane leniwie, hashowane assety z cache 1 rok, gzip. Lighthouse (lokalnie): desktop 99 / 100 / 100 / 100, mobile ~90 bez kompresji serwera.
- Dostępność: WCAG AA kontrasty, nawigacja klawiaturą, `prefers-reduced-motion`, opisy dla czytników.
- Bezpieczeństwo/RODO: CSP z hashem, HSTS, brak cookies i trackerów, double opt-in, hash IP, polityka prywatności.

## Do potwierdzenia przed startem

- `site.config.mjs → facts`: **700+ pytań** (policzone w helloekg-studio: 580 ABCD + 120 interaktywnych), **33 lekcje / 7 modułów**, **16 h** (z notatek CEO w Notion).
- Administrator danych w polityce prywatności: **Cardiomind sp. z o.o.** (przyjęte jak dla SMK Helper) i adres `hello@helloekg.com`.
- Pytania przeszły moją weryfikację merytoryczną z wytycznymi ESC/ACC-AHA, ale jak każdą treść kursu — warto puścić je przez Waszą recenzję medyczną.
