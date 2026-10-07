import { esc, ecgLine, signupForm } from './util.mjs';
import { head, nav, footer } from './layout.mjs';

function shell({ cfg, assets, page, body }) {
  return `${head({ cfg, assets, page })}
<body class="page">
${nav({ minimal: true })}
<main id="main">
${body}
</main>
${footer({ cfg })}
</body>
</html>
`;
}

function notice({ kicker, title, text, extra = '' }) {
  return `<section class="notice">
  <div class="wrap notice__inner">
    <p class="label label--g">${esc(kicker)}</p>
    <h1 class="display notice__h">${title}</h1>
    <p class="lead">${text}</p>
    ${extra}
  </div>
  ${ecgLine()}
</section>`;
}

export function renderNotFound(ctx) {
  return shell({
    ...ctx,
    page: { path: '/404', title: 'Asystole — page not found | helloEKG', description: 'This page has no rhythm.', noindex: true },
    body: `<section class="notice notice--flat">
  <div class="wrap notice__inner">
    <p class="label label--g">404 · Flat line</p>
    <h1 class="display notice__h">Asystole.<br><span class="muted">Not shockable.</span></h1>
    <p class="lead">Neither is this page — it does not exist. Start compressions on the homepage instead.</p>
    <p><a class="btn btn--primary" href="/">Back to the homepage</a></p>
  </div>
  <div class="flatline" aria-hidden="true"><span></span></div>
</section>`,
  });
}

export function renderCheckInbox(ctx) {
  return shell({
    ...ctx,
    page: { path: '/check-inbox', title: 'Check your inbox | helloEKG', description: 'Confirm your email address.', noindex: true },
    body: notice({
      kicker: 'Almost there',
      title: 'Check your inbox.',
      text: 'We have sent you one email with a confirmation link. Click it and you are on the list. Nothing there? Look in spam or promotions — and drag us to your inbox so the Tuesday case lands where you will see it.',
      extra: '<p><a class="btn btn--ghost" href="/#challenge">Meanwhile: take the ECG Challenge</a></p>',
    }),
  });
}

export function renderConfirmed(ctx) {
  return shell({
    ...ctx,
    page: { path: '/confirmed', title: 'You are on the list | helloEKG', description: 'Subscription confirmed.', noindex: true },
    body: notice({
      kicker: 'Confirmed',
      title: 'Sinus rhythm restored.',
      text: 'You are on the list. The next case arrives on Tuesday, and you will hear about the English edition before anyone else.',
      extra: '<p><a class="btn btn--primary" href="/#challenge">Take the ECG Challenge</a></p>',
    }),
  });
}

export function renderUnsubscribed(ctx) {
  return shell({
    ...ctx,
    page: { path: '/unsubscribed', title: 'Unsubscribed | helloEKG', description: 'You have been unsubscribed.', noindex: true },
    body: notice({
      kicker: 'Unsubscribed',
      title: 'Done. No more emails.',
      text: 'Your address has been removed from the list. If that was a mistake, you can rejoin below.',
      extra: signupForm({ id: 'email-rejoin', source: 'rejoin', cta: 'Rejoin' }),
    }),
  });
}

export function renderSignupError(ctx) {
  return shell({
    ...ctx,
    page: { path: '/signup-error', title: 'Something went wrong | helloEKG', description: 'Signup error.', noindex: true },
    body: notice({
      kicker: 'Artifact on the line',
      title: 'That did not go through.',
      text: 'Check the address and try again in a minute. If it keeps happening, write to <a href="mailto:' + ctx.cfg.contactEmail + '">' + ctx.cfg.contactEmail + '</a>.',
      extra: signupForm({ id: 'email-retry', source: 'retry', cta: 'Try again' }),
    }),
  });
}

export function renderPrivacy(ctx) {
  const { cfg } = ctx;
  const c = cfg.controller;
  return shell({
    ...ctx,
    page: {
      path: '/privacy',
      title: 'Privacy policy | helloEKG',
      description: 'How helloEKG collects, uses and protects personal data on helloekg.com.',
    },
    body: `<article class="prose wrap">
  <p class="label label--g">Legal</p>
  <h1 class="h2">Privacy policy</h1>
  <p class="muted">Effective ${cfg.lastReviewed}. This policy covers the website helloekg.com and the helloEKG email list.</p>

  <h2>1. Who is responsible for your data</h2>
  <p>The data controller is ${esc(c.name)}, ${esc(c.country)} (“helloEKG”, “we”). Contact for anything related to your data: <a href="mailto:${cfg.contactEmail}">${cfg.contactEmail}</a>.</p>

  <h2>2. What we collect and why</h2>
  <ul>
    <li><b>Email list.</b> When you sign up we store your email address, the date and time of signup and of confirmation, where on the page you signed up (for example “case-01”), and — if you finished the ECG Challenge — your score. We use it to send you the weekly ECG case and news about helloEKG, including early access to the English edition. Legal basis: your consent (Art. 6(1)(a) GDPR), which you can withdraw at any time.</li>
    <li><b>Abuse prevention.</b> To limit automated signups we keep a one-way hash of your IP address for a short time. Legal basis: our legitimate interest in protecting the service (Art. 6(1)(f) GDPR).</li>
    <li><b>Server logs.</b> Our hosting provider records standard technical logs (IP address, time, requested URL, browser) to keep the site secure and running. Legal basis: legitimate interest.</li>
  </ul>
  <p>The ECG Challenge runs entirely in your browser. Your answers are not sent to us unless you choose to share your score when signing up.</p>

  <h2>3. Double opt-in</h2>
  <p>After you sign up we send a single confirmation email. You are added to the list only after you click the link in it. Unconfirmed addresses are deleted after 30 days.</p>

  <h2>4. Cookies and tracking</h2>
  <p>This website does not use advertising or analytics cookies and does not load third-party trackers. Fonts are served from our own server.</p>

  <h2>5. Who we share data with</h2>
  <p>We do not sell personal data. We use processors that act on our instructions: our hosting provider (home.pl, Poland) and, if we use one to send newsletters, an email delivery provider bound by a data processing agreement. If a provider is located outside the European Economic Area, transfers rely on adequacy decisions or standard contractual clauses.</p>

  <h2>6. How long we keep it</h2>
  <p>Until you unsubscribe or withdraw consent. After that we keep only a record that you unsubscribed, so we do not email you again.</p>

  <h2>7. Your rights</h2>
  <p>You can access, correct or delete your data, restrict or object to processing, receive a copy of your data, and withdraw consent at any time — every email has a one-click unsubscribe link. You can also lodge a complaint with a supervisory authority; in Poland that is the President of the Personal Data Protection Office (UODO), or the authority in your country of residence.</p>

  <h2>8. Medical disclaimer</h2>
  <p>helloEKG provides educational content for healthcare professionals and students. It is not medical advice and does not replace clinical judgment or local protocols.</p>

  <h2>9. Changes</h2>
  <p>If we change this policy we will update the date above and, for material changes, tell subscribers by email.</p>
</article>`,
  });
}
