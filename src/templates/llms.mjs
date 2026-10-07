// llms.txt (https://llmstxt.org) — a concise map for AI assistants and
// answer engines — plus llms-full.txt with every question, answer and
// explanation in Markdown, so models can quote helloEKG accurately.
const L = ['A', 'B', 'C', 'D', 'E'];

export function llmsTxt({ cfg, heroCase, questions, curriculum, faq }) {
  const o = cfg.origin;
  return `# helloEKG

> helloEKG is an online ECG (EKG) interpretation course that teaches from cardiac physiology outward: visual lessons with live traces, ${cfg.facts.questions} questions that explain why every option is right or wrong, and clinical cases. ${cfg.facts.modules} modules, ${cfg.facts.lessons} lessons, about ${cfg.facts.hours} hours. For medical students, junior doctors, paramedics/EMTs and nurses. English edition: early access list at ${o}/#join. Polish edition: https://helloekg.pl/.

Key facts:
- Method: physiology first, pattern second — "the heart is an orchestra, the ECG is the recording"; 12 leads are 12 cameras filming the same heart.
- Systematic reading order taught in every case: technique → rhythm → rate → axis → waves and intervals (P, PR, QRS, ST, T, QT) → clinical context.
- Question formats: multiple choice, tap-the-trace (hotspot), drag and drop, matching, sorting, fill-in.
- Explanations reference current ESC and ACC/AHA guidelines and resuscitation council algorithms; content is medically reviewed before publication.
- Free on the website: Case 01 and the 30-question ECG Challenge, no account required; a weekly ECG case by email.
- Contact: ${cfg.contactEmail}

## Pages

- [helloEKG — Online ECG Course (home)](${o}/): Case 01, the method, 12-lead territories, the ECG Challenge, curriculum and FAQ.
- [Case 01 — inferior STEMI with complete heart block](${o}/#case): ${heroCase.headline.join(' ')}
- [The ECG Challenge](${o}/#challenge): ${questions.length} physiology-based ECG questions with explanations.
- [Curriculum](${o}/#curriculum): ${curriculum.map((m) => m.title).join(' · ')}.
- [FAQ](${o}/#faq): ${faq.length} questions about learning ECG interpretation and the course.
- [Privacy policy](${o}/privacy)

## Optional

- [Full text of all questions, answers and explanations](${o}/llms-full.txt)
- [Polish edition — helloekg.pl](https://helloekg.pl/)
`;
}

export function llmsFull({ cfg, heroCase: c, questions, categories, curriculum, faq, method }) {
  const o = cfg.origin;
  const cat = Object.fromEntries(categories.map((x) => [x.id, x.label]));
  let s = `# helloEKG — Online ECG Interpretation Course (full text)

Source: ${o}/ · Last reviewed: ${cfg.lastReviewed} · Educational content for healthcare professionals and students; not medical advice.

## Case 01 — ${c.kicker}

${c.headline.join(' ')} ${c.vignette}

**Question:** ${c.question}

${c.options.map((x, i) => `${L[i]}. ${x}`).join('\n')}

**Answer:** ${L[c.answer]}. ${c.options[c.answer]}

${c.sections.map((x) => `### ${x.title}\n\n${x.body}`).join('\n\n')}

**Pearl:** ${c.pearl}

## The method — the heart is an orchestra, the ECG is the recording

${method.map((m) => `### ${m.title} (${m.label})\n\n${m.body}\n\nAt the bedside: ${m.clinic}`).join('\n\n')}

## The ECG Challenge — ${questions.length} questions

`;
  questions.forEach((q, i) => {
    s += `### ${i + 1}. ${q.q}

Topic: ${cat[q.cat]} · Link: ${o}/#q-${q.id}

${q.options.map((x, k) => `${L[k]}. ${x}`).join('\n')}

**Answer:** ${L[q.answer]}. ${q.options[q.answer]}

**Why:** ${q.explain}

**Pearl:** ${q.pearl}

`;
  });
  s += `## Curriculum — ${curriculum.length} modules

${curriculum.map((m) => `### Module ${m.n}: ${m.title} — ${m.tagline}\n\n${m.lessons.map((l, i) => `${i + 1}. ${l}`).join('\n')}`).join('\n\n')}

## FAQ

${faq.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n')}
`;
  return s;
}
