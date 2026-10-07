import { esc, pad2, icon, ecgLine, signupForm } from './util.mjs';
import { head, nav, footer } from './layout.mjs';
import { complexFigure, conductionFigure, twelveLead, wenckebachStrip, flutterStrip } from './figures.mjs';

const KEYS = ['A', 'B', 'C', 'D', 'E'];

function options(q) {
  return `<ol class="opts" role="list">
${q.options.map((o, i) => `      <li><button class="opt" type="button" data-i="${i}"><span class="opt__key" aria-hidden="true">${KEYS[i]}</span><span class="opt__text">${esc(o)}</span><span class="opt__mark" aria-hidden="true"></span></button></li>`).join('\n')}
    </ol>`;
}

function question(q, i, total, catLabel) {
  return `<article class="q" id="q-${q.id}" data-cat="${q.cat}" data-answer="${q.answer}" aria-labelledby="q-${q.id}-t">
    <header class="q__meta">
      <span class="label label--g">${esc(catLabel)}</span>
      <span class="label q__num">${pad2(i + 1)} / ${total}</span>
    </header>
    <h3 class="q__title" id="q-${q.id}-t">${esc(q.q)}</h3>
    ${options(q)}
    <details class="explain">
      <summary>Show answer and explanation</summary>
      <div class="explain__body">
        <p class="explain__answer"><span class="label label--g">Answer ${KEYS[q.answer]}</span> ${esc(q.options[q.answer])}</p>
        <p>${esc(q.explain)}</p>
        <p class="pearl"><span class="label">Pearl</span> ${esc(q.pearl)}</p>
      </div>
    </details>
  </article>`;
}

export function renderIndex({ cfg, assets, page, heroCase: c, questions, categories, curriculum, faq, method, leads }) {
  const catLabel = Object.fromEntries(categories.map((x) => [x.id, x.label]));
  const counts = Object.fromEntries(categories.map((x) => [x.id, questions.filter((q) => q.cat === x.id).length]));
  const f = cfg.facts;
  const statement =
    'Most courses teach you to recognize an ECG. helloEKG teaches you to understand one — so the next tracing, the one you have never seen before, still makes sense.';

  return `${head({ cfg, assets, page })}
<body>
${nav()}
<main id="main">

<!-- ─────────────────────────────── CASE 01 ─────────────────────────────── -->
<section class="hero" id="case" aria-labelledby="hero-h">
  <div class="wrap">
    <div class="hero__top">
      <div class="hero__copy">
        <h1 class="hero__product" id="hero-h"><span class="live" aria-hidden="true"></span>helloEKG · The online ECG course that teaches you why</h1>
        <p class="label label--g hero__kicker">${esc(c.kicker)}</p>
        <p class="display hero__headline">${c.headline.map((l) => `<span>${esc(l)}</span>`).join(' ')}</p>
        <p class="hero__vignette">${esc(c.vignette)}</p>
      </div>
      <div class="hero__heart" aria-hidden="true">
        <canvas class="heart" data-heart width="560" height="560"></canvas>
        <p class="hero__heart-note label">Beating at Mark’s rate · <span data-hr>${c.monitor.hr}</span>/min</p>
      </div>
    </div>

    <figure class="monitor" data-monitor aria-label="${esc(c.monitor.aria)}">
      <div class="monitor__bar">
        <span class="label"><span class="dot" aria-hidden="true"></span>${esc(c.monitor.bed)} · Live</span>
        <span class="label monitor__scale">II · III · aVL — 25 mm/s · 10 mm/mV</span>
        <span class="label" data-clock>${c.monitor.clock}</span>
      </div>
      <div class="monitor__body">
        <div class="monitor__traces">
          <canvas data-trace aria-hidden="true"></canvas>
          <span class="monitor__lead" data-row="0">II</span>
          <span class="monitor__lead" data-row="1">III</span>
          <span class="monitor__lead" data-row="2">aVL</span>
        </div>
        <dl class="vitals">
          <div class="vitals__hr"><dt class="label">HR</dt><dd><b data-hr>${c.monitor.hr}</b><span class="vitals__beat" data-beat>${icon.heart}</span></dd></div>
          <div><dt class="label">NIBP</dt><dd>${c.monitor.bp}</dd></div>
          <div><dt class="label">SpO₂</dt><dd>${c.monitor.spo2}<small>%</small></dd></div>
          <div class="vitals__st"><dt class="label">ST mm</dt><dd>${c.monitor.st.map((s) => `<span><i>${s.lead}</i> ${s.value}</span>`).join('')}</dd></div>
        </dl>
      </div>
      <figcaption class="sr-only">${esc(c.monitor.aria)}</figcaption>
    </figure>

    <div class="case" data-case data-answer="${c.answer}">
      <div class="case__ask">
        <p class="label">Your call</p>
        <h2 class="case__q">${esc(c.question)}</h2>
      </div>
      ${options(c)}
      <details class="explain explain--case" data-case-explain>
        <summary>Show answer and explanation</summary>
        <div class="explain__body">
          <p class="case__verdict" data-verdict data-right="${esc(c.verdict.right)}" data-wrong="${esc(c.verdict.wrong)}">${esc(c.verdict.right)}</p>
          <div class="case__grid">
            ${c.sections.map((s, i) => `<div class="case__cell"><p class="label label--g">${pad2(i + 1)} · ${esc(s.title)}</p><p>${esc(s.body)}</p></div>`).join('\n            ')}
          </div>
          <p class="pearl pearl--lg"><span class="label">Pearl from the night shift</span> ${esc(c.pearl)}</p>
          <div class="case__cta">
            <div>
              <p class="h3">That was lesson one.</p>
              <p class="muted">Get a case like Mark’s every Tuesday — one tracing, one decision, the physiology behind it. Plus early access to the English edition.</p>
            </div>
            ${signupForm({ id: 'email-case', source: 'case-01', cta: 'Send me the next case' })}
          </div>
        </div>
      </details>
    </div>
  </div>
</section>

<!-- ─────────────────────────────── STATEMENT ─────────────────────────────── -->
<section class="statement" aria-label="What helloEKG is">
  <div class="wrap">
    <p class="statement__text" data-words>${statement.split(' ').map((w) => `<span class="w">${esc(w)}</span>`).join(' ')}</p>
    <dl class="facts">
      <div data-reveal><dt class="label">Modules</dt><dd data-count="${f.modules}">${f.modules}</dd></div>
      <div data-reveal><dt class="label">Lessons</dt><dd data-count="${f.lessons}">${f.lessons}</dd></div>
      <div data-reveal><dt class="label">Explained questions</dt><dd data-count="${parseInt(f.questions, 10)}" data-suffix="+">${f.questions}</dd></div>
      <div data-reveal><dt class="label">Hours of material</dt><dd data-count="${f.hours}">${f.hours}</dd></div>
    </dl>
  </div>
</section>

<!-- ─────────────────────────────── METHOD ─────────────────────────────── -->
<section class="method" id="method" aria-labelledby="method-h">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="label label--g">The method</p>
      <h2 class="h2" id="method-h">The heart is an orchestra.<br><span class="muted">The ECG is the recording.</span></h2>
      <p class="lead">Every wave on the strip is a moment in the performance. Learn who plays it and why — and the abnormal ones start explaining themselves.</p>
    </header>
    <div class="method__grid">
      <div class="method__visual" data-method-visual data-step="p">
        <div class="method__card">
          ${conductionFigure()}
          ${complexFigure()}
        </div>
      </div>
      <ol class="method__steps" role="list">
        ${method.map((s, i) => `<li class="step" data-step="${s.seg}">
          <p class="label label--g">${pad2(i + 1)} · ${esc(s.label)}</p>
          <h3 class="step__title">${esc(s.title)}</h3>
          <p>${esc(s.body)}</p>
          <p class="step__clinic"><span class="label">At the bedside</span> ${esc(s.clinic)}</p>
        </li>`).join('\n        ')}
      </ol>
    </div>
  </div>
</section>

<!-- ─────────────────────────────── 12 LEADS ─────────────────────────────── -->
<section class="leads" id="leads" aria-labelledby="leads-h">
  <div class="wrap leads__grid">
    <div class="leads__copy" data-reveal>
      <p class="label label--g">12 leads, 12 cameras</p>
      <h2 class="h2" id="leads-h">Twelve cameras.<br>One concert.</h2>
      <p class="lead">Each lead films the same heart from a different seat. Know where each camera stands and an ST change stops being a pattern — it becomes an address.</p>
      <div class="chips" role="group" aria-label="Choose a territory" data-territories>
        ${leads.map((t, i) => `<button class="chip" type="button" aria-pressed="${i === 0}" data-territory="${t.id}" data-leads="${t.leads.join(' ')}" data-recip="${t.reciprocal.join(' ')}">${esc(t.label)}</button>`).join('')}
      </div>
      <div class="territory" aria-live="polite">
        ${leads.map((t, i) => `<div class="territory__item" data-for="${t.id}"${i === 0 ? '' : ' hidden'}>
          <p class="territory__artery">${esc(t.artery)}</p>
          <p class="label">${t.mirror ? 'Seen as a mirror image in' : 'Leads'} ${t.leads.join(', ')}${t.reciprocal.length ? ` · Reciprocal ${t.reciprocal.join(', ')}` : ''}</p>
          <p class="muted">${esc(t.pearl)}</p>
        </div>`).join('\n        ')}
      </div>
    </div>
    <div class="leads__ecg" data-reveal>
      ${twelveLead()}
      <p class="label leads__legend"><span class="sw sw--on"></span>Facing the territory <span class="sw sw--rc"></span>Reciprocal</p>
    </div>
  </div>
</section>

<!-- ─────────────────────────────── INSIDE A LESSON ─────────────────────────────── -->
<section class="inside" id="inside" aria-labelledby="inside-h">
  <div class="wrap">
    <header class="section-head section-head--center" data-reveal>
      <p class="label label--g">Inside helloEKG</p>
      <h2 class="h2" id="inside-h">Not another pattern-matching course.</h2>
      <p class="lead">Every lesson runs the same loop: see it, test it, use it at 3 a.m. It is how physiology turns into reflex.</p>
    </header>
    <div class="inside__cards">
      <article class="mock" data-reveal>
        <p class="label mock__step">01 · Visual lesson</p>
        <div class="mock__screen">
          <div class="mock__top"><span class="label label--g">Module 05 · Lesson 02</span><span class="label">12 min</span></div>
          <h3 class="mock__title">Mobitz I — the gatekeeper gets tired</h3>
          <p class="mock__text">The AV node is a careful gatekeeper. Each beat it lets through costs a little more time — until, one beat, it needs a rest.</p>
          <div class="mock__strip"><span class="label label--g mock__live">Live trace</span>${wenckebachStrip()}</div>
          <div class="mock__rule"><span class="label">Pearl from the night shift</span><p>Wenckebach in a fit 20-year-old asleep is usually vagal and harmless. Mobitz II at any age is not.</p></div>
          <div class="progress" aria-hidden="true"><span></span></div>
        </div>
        <p class="mock__cap">Physiology told in pictures and metaphors, with live, moving traces inside the text.</p>
      </article>
      <article class="mock" data-reveal>
        <p class="label mock__step">02 · Question with a why</p>
        <div class="mock__screen">
          <div class="mock__top"><span class="label label--g">Tap the trace</span><span class="label">Q 14 / 20</span></div>
          <h3 class="mock__title">Tap one flutter wave.</h3>
          <div class="mock__strip">${flutterStrip()}</div>
          <div class="opt opt--demo is-right"><span class="opt__key">✓</span><span class="opt__text">Sawtooth F wave, ~300/min, no isoelectric baseline between them</span></div>
          <p class="mock__text">Flutter waves are a single macro-reentrant circuit in the right atrium. That is why they are so regular — and why ablation of the cavotricuspid isthmus cures it.</p>
        </div>
        <p class="mock__cap">Six formats: multiple choice, tap-the-trace, drag and drop, matching, sorting and fill-in. Every one explains why the wrong answers are wrong.</p>
      </article>
      <article class="mock" data-reveal>
        <p class="label mock__step">03 · Clinical case</p>
        <div class="mock__screen">
          <div class="mock__top"><span class="label label--g">Case · Syncope</span><span class="label">Step 2 / 4</span></div>
          <h3 class="mock__title">Barbara, 81, fainted in church.</h3>
          <p class="mock__text">P waves at 80/min. Narrow QRS at 40/min. Nothing links them.</p>
          <div class="opt opt--demo is-right"><span class="opt__key">✓</span><span class="opt__text">Complete heart block, junctional escape</span></div>
          <div class="opt opt--demo"><span class="opt__key">B</span><span class="opt__text">Mobitz II</span></div>
          <p class="mock__text">Narrow escape means the backup pacemaker sits high — the better of two bad options. Next: monitor, pacing pads, find the cause.</p>
        </div>
        <p class="mock__cap">Then the same idea at the bedside: a patient, a strip, a decision. You learn the order of thought, not just the answer.</p>
      </article>
    </div>
    <ul class="features" role="list" data-reveal>
      <li>${icon.check}Review mode for your mistakes</li>
      <li>${icon.check}Exam simulation</li>
      <li>${icon.check}Verifiable certificate</li>
      <li>${icon.check}Built for your phone</li>
      <li>${icon.check}Guideline-referenced explanations</li>
    </ul>
  </div>
</section>

${ecgLine('ecgline--section')}

<!-- ─────────────────────────────── CHALLENGE ─────────────────────────────── -->
<section class="challenge" id="challenge" aria-labelledby="challenge-h">
  <div class="wrap">
    <header class="section-head section-head--center" data-reveal>
      <p class="label label--g">The ECG Challenge</p>
      <h2 class="h2" id="challenge-h">${questions.length} questions.<br><span class="muted">No sign-up. No mercy on physiology.</span></h2>
      <p class="lead">From the PR segment to Brugada. Each answer comes with the mechanism behind it — the same way every helloEKG lesson works.</p>
    </header>

    <div class="quiz" data-quiz>
      <div class="quiz__bar">
        <div class="chips chips--scroll" role="group" aria-label="Filter by topic" data-filter>
          <button class="chip" type="button" aria-pressed="true" data-cat="all">All <span>${questions.length}</span></button>
          ${categories.map((x) => `<button class="chip" type="button" aria-pressed="false" data-cat="${x.id}">${esc(x.label)} <span>${counts[x.id]}</span></button>`).join('')}
        </div>
        <div class="quiz__status">
          <span class="label" data-quiz-pos>01 / ${questions.length}</span>
          <span class="label label--g" data-quiz-score>0 correct</span>
          <button class="link-btn label" type="button" data-quiz-mode aria-pressed="false">View all</button>
        </div>
      </div>
      <div class="progress quiz__progress" aria-hidden="true"><span data-quiz-progress></span></div>

      <div class="quiz__deck" data-deck>
        ${questions.map((q, i) => question(q, i, questions.length, catLabel[q.cat])).join('\n        ')}
      </div>

      <div class="quiz__nav" data-quiz-nav hidden>
        <button class="btn btn--ghost" type="button" data-prev>Previous</button>
        <button class="btn btn--primary" type="button" data-next disabled>Next question ${icon.arrow}</button>
      </div>

      <template data-tpl-gate>
        <div class="gate">
          <p class="label label--g">Halfway check</p>
          <p class="h3">You are <b data-gate-score></b> through the first ten.</p>
          <p class="muted">Want a new case every Tuesday, written exactly like these? One email a week, nothing else.</p>
          ${signupForm({ id: 'email-gate', source: 'challenge-gate', cta: 'Yes, send me cases', compact: true })}
          <button class="link-btn label" type="button" data-gate-skip>Keep going without it ${icon.arrow}</button>
        </div>
      </template>

      <template data-tpl-result>
        <div class="result">
          <p class="label label--g">Your result</p>
          <p class="result__score"><b data-result-score></b><span>/ <i data-result-total></i></span></p>
          <p class="h3" data-result-msg></p>
          <div class="result__bars" data-result-bars></div>
          <div class="result__cta">
            <p class="muted">Get your next case on Tuesday and early access to the full course — ${f.questions} questions like these, ${f.lessons} lessons, ${f.modules} modules.</p>
            ${signupForm({ id: 'email-result', source: 'challenge-result', cta: 'Send me the next case' })}
          </div>
          <button class="link-btn label" type="button" data-restart>Start again</button>
        </div>
      </template>
    </div>
  </div>
</section>

<!-- ─────────────────────────────── CURRICULUM ─────────────────────────────── -->
<section class="curriculum" id="curriculum" aria-labelledby="curriculum-h">
  <div class="wrap curriculum__grid">
    <header class="section-head" data-reveal>
      <p class="label label--g">Curriculum</p>
      <h2 class="h2" id="curriculum-h">${f.modules} modules.<br>${f.lessons} lessons.<br><span class="muted">One system.</span></h2>
      <p class="lead">From a single pacemaker cell to a patient in VF. Each module ends with questions; the last one is nothing but cases.</p>
    </header>
    <div class="modules">
      ${curriculum.map((m) => `<details class="module" data-reveal>
        <summary>
          <span class="module__n label label--g">${m.n}</span>
          <span class="module__t"><b>${esc(m.title)}</b><span class="muted">${esc(m.tagline)}</span></span>
          <span class="module__c label">${m.lessons.length} lessons</span>
          <span class="module__i">${icon.plus}</span>
        </summary>
        <ol class="module__lessons">
          ${m.lessons.map((l) => `<li>${esc(l)}</li>`).join('')}
        </ol>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ─────────────────────────────── AUDIENCE ─────────────────────────────── -->
<section class="audience" aria-labelledby="audience-h">
  <div class="wrap">
    <header class="section-head" data-reveal>
      <p class="label label--g">Who it is for</p>
      <h2 class="h2" id="audience-h">Built for the first time<br>the strip is yours to read.</h2>
    </header>
    <div class="audience__grid">
      <article class="who" data-reveal><p class="label label--g">Medical students</p><h3 class="h3">Finals, OSCEs, and the first ward round</h3><p class="muted">Stop memorizing criteria the night before. Understand them once and recall them under pressure.</p></article>
      <article class="who" data-reveal><p class="label label--g">Junior doctors</p><h3 class="h3">Your first night on call</h3><p class="muted">The strip the nurse hands you at 3 a.m. — read it in a fixed order and know what to do next.</p></article>
      <article class="who" data-reveal><p class="label label--g">Paramedics &amp; EMTs</p><h3 class="h3">The 12-lead in the field</h3><p class="muted">STEMI and its equivalents, dangerous blocks and broad-complex tachycardias before the hospital door.</p></article>
      <article class="who" data-reveal><p class="label label--g">Nurses</p><h3 class="h3">Telemetry, CCU, ICU, ED</h3><p class="muted">Rhythm strips, pacemaker spikes and electrolyte changes — recognized early, escalated with confidence.</p></article>
    </div>
  </div>
</section>

<!-- ─────────────────────────────── EDITORIAL (paper) ─────────────────────────────── -->
<section class="paper" aria-labelledby="editorial-h">
  <div class="wrap paper__grid">
    <header class="section-head" data-reveal>
      <p class="label label--d">Editorial standards</p>
      <h2 class="h2" id="editorial-h">Written like a textbook.<br>Checked like a chart.</h2>
    </header>
    <ul class="standards" role="list">
      <li data-reveal><b>Every option explained.</b> Not just why the right answer is right — why each wrong one is wrong, and when it would be right.</li>
      <li data-reveal><b>Guideline-referenced.</b> Explanations follow current ESC and ACC/AHA guidance and resuscitation council algorithms, and change when they do.</li>
      <li data-reveal><b>Reviewed before publishing.</b> Content moves from draft to medical review to approval; nothing reaches learners on the first pass.</li>
      <li data-reveal><b>Real tracings, handled properly.</b> Every ECG image is licensed and anonymized before it is used.</li>
    </ul>
    <p class="paper__note label label--d">Last reviewed ${cfg.lastReviewed} · Educational content — always interpret the ECG in the context of the patient.</p>
  </div>
</section>

<!-- ─────────────────────────────── FAQ ─────────────────────────────── -->
<section class="faq" id="faq" aria-labelledby="faq-h">
  <div class="wrap faq__grid">
    <header class="section-head" data-reveal>
      <p class="label label--g">FAQ</p>
      <h2 class="h2" id="faq-h">Questions,<br>answered properly.</h2>
    </header>
    <div class="faq__list">
      ${faq.map((x) => `<details class="faq__item">
        <summary><h3>${esc(x.q)}</h3><span class="module__i">${icon.plus}</span></summary>
        <p>${esc(x.a)}</p>
      </details>`).join('\n      ')}
    </div>
  </div>
</section>

<!-- ─────────────────────────────── JOIN ─────────────────────────────── -->
<section class="join" id="join" aria-labelledby="join-h">
  ${ecgLine()}
  <div class="wrap join__inner">
    <p class="label label--g" data-reveal>Early access · English edition</p>
    <h2 class="display join__h" id="join-h" data-reveal>One ECG.<br>Every Tuesday.</h2>
    <p class="lead" data-reveal>A real-world case, the physiology behind it and the decision it demands — in your inbox in two minutes of reading. The list also gets the English edition first.</p>
    <div data-reveal>${signupForm({ id: 'email-join', source: 'join', cta: 'Join the list', note: 'Free. Double opt-in. Unsubscribe in one click.' })}</div>
  </div>
</section>

</main>
${footer({ cfg })}
</body>
</html>
`;
}
