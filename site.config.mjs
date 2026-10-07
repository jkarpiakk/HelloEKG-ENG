// Single source of truth for everything that differs between environments
// or that the business may want to change without touching templates.
export default {
  origin: 'https://helloekg.com',
  name: 'helloEKG',
  lang: 'en',
  locale: 'en_US',
  // Polish edition — used for hreflang. The PL page must link back with
  // <link rel="alternate" hreflang="en" href="https://helloekg.com/">.
  alternates: [
    { hreflang: 'pl', href: 'https://helloekg.pl/' },
  ],
  contactEmail: 'hello@helloekg.com',
  // Legal entity shown in the privacy policy (data controller).
  controller: {
    name: 'Cardiomind sp. z o.o.',
    country: 'Poland',
  },
  instagram: 'https://www.instagram.com/helloekg/',
  // Paste the token from Google Search Console → Settings → Ownership
  // verification → HTML tag (content="..."). Leave empty to omit the tag.
  // Prefer the DNS (Domain property) method — see README.
  googleSiteVerification: '',
  bingSiteVerification: '',
  // IndexNow key (Bing, Yandex, Seznam, Naver). The build publishes
  // /<key>.txt so search engines can verify pings from scripts/indexnow.mjs.
  indexNowKey: '7f3c1e9a5b2d4f608e1a9c3b5d7e2f41',
  lastReviewed: '2026-10-07',
  // Course facts used in copy and structured data. Keep them true.
  facts: {
    modules: 7,
    lessons: 33,
    questions: '700+',
    hours: 16,
    formats: 6,
  },
};
