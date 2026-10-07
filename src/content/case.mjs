// Case 01 — the courier. Inferior STEMI (RCA) with complete AV block at the
// level of the AV node. The live monitor in the hero is synthesised from the
// same morphology (see CASE in src/js/ecg-synth.js).
export default {
  id: 'case-01',
  kicker: 'Case 01 · 03:12 · Emergency department',
  headline: ['Mark, 58. Courier.', 'Crushing chest pain.', 'Heart rate: 40.'],
  vignette:
    'An hour of pain behind the sternum. Pale, sweating, blood pressure 86/50. P waves march at 88/min, while narrow QRS complexes at 40/min ignore them. ST elevation in II, III and aVF — highest in III — with ST depression in I and aVL.',
  monitor: {
    bed: 'BED 4 · ED',
    clock: '03:12:40',
    hr: 40,
    atrialRate: 88,
    bp: '86/50',
    spo2: 95,
    st: [
      { lead: 'II', value: '+2.5' },
      { lead: 'III', value: '+3.5' },
      { lead: 'aVL', value: '−2.0' },
    ],
    aria:
      'Live ECG monitor showing leads II, III and aVL. Sinus P waves at 88 per minute are dissociated from narrow QRS complexes at 40 per minute. ST elevation in II and III, larger in III, with reciprocal ST depression in aVL.',
  },
  question: 'Where is the block — and what is driving it?',
  options: [
    'Below the AV node: an LAD occlusion has destroyed both bundle branches.',
    'In the AV node: the right coronary artery is occluded, starving the AV nodal artery and triggering a vagal surge.',
    'Everywhere: hyperkalemia is blocking conduction throughout the heart.',
    'In the sinus node: a circumflex occlusion has stopped it firing.',
  ],
  answer: 1,
  verdict: {
    right: 'Exactly. Inferior STEMI with complete AV block at the level of the node.',
    wrong: 'Not this time — and that’s the point of practicing here. Inferior STEMI with complete AV block at the level of the node.',
  },
  sections: [
    {
      title: 'Read the territory',
      body:
        'ST elevation in II, III and aVF with reciprocal depression in aVL is an inferior STEMI. Elevation in III greater than in II, plus ST depression in lead I, points to the right coronary artery rather than the circumflex.',
    },
    {
      title: 'Why the AV node',
      body:
        'In roughly 80–90% of people the AV nodal artery branches from the RCA. Occlude the RCA and the node goes ischemic. Two more mechanisms pile on: the Bezold–Jarisch reflex — vagal afferents in the inferior wall fire, slowing the heart and dropping blood pressure — and adenosine released by ischemic tissue, which blocks the node further. That is why aminophylline sometimes works when atropine doesn’t.',
    },
    {
      title: 'Why it is less sinister than it looks',
      body:
        'The block sits high, so the escape rhythm is junctional: narrow QRS, 40–60/min, fairly reliable. It often responds to atropine and usually resolves after reperfusion. Complete block in an anterior STEMI is a different animal: the septum and both bundle branches are necrotic, the escape is ventricular — wide, 20–40/min, unstable — and pacing is almost always needed.',
    },
    {
      title: 'What you do at 03:12',
      body:
        'Activate the cath lab — reperfusion is the treatment for this block. Record V4R: an RCA occlusion often takes the right ventricle with it. An infarcted right ventricle is preload-dependent, so avoid nitrates and diuretics and give fluid carefully. Atropine for symptomatic bradycardia, pacing pads on.',
    },
  ],
  pearl: 'One ECG, three answers: which artery, which level of block — and what not to give.',
};
