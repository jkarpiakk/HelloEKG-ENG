// The helloEKG ECG Challenge. Plain text only (no HTML) — the same strings
// feed the page, the JSON-LD Quiz and llms-full.txt.
// `answer` is the zero-based index of the correct option.

export const categories = [
  { id: 'physiology', label: 'Physiology' },
  { id: 'rhythm', label: 'Rhythm' },
  { id: 'conduction', label: 'Conduction' },
  { id: 'ischemia', label: 'Ischemia' },
  { id: 'electrolytes', label: 'Electrolytes & drugs' },
  { id: 'devices', label: 'Devices & mimics' },
];

export const questions = [
  // ── Physiology ──────────────────────────────────────────────────────────
  {
    id: 'pr-segment',
    cat: 'physiology',
    q: 'The PR segment is flat — yet a lot is happening during it. What?',
    options: [
      'Atrial repolarization cancelling out ventricular activity',
      'Slow conduction through the AV node — too little tissue to register on the surface ECG',
      'Depolarization of the interventricular septum',
      'The sinus node recharging for the next beat',
    ],
    answer: 1,
    explain:
      'After the P wave the impulse enters the AV node. Nodal cells depolarize through slow L-type calcium channels instead of fast sodium channels, so conduction drops to about 0.05 m/s. The node is tiny, so its activity is invisible at the skin and the trace stays flat. The delay is deliberate: it lets atrial contraction top up ventricular filling before systole.',
    pearl: 'PR over 200 ms is first-degree AV block: the gatekeeper is slower than usual, but every beat still gets through.',
  },
  {
    id: 'st-isoelectric',
    cat: 'physiology',
    q: 'Why is the ST segment normally isoelectric?',
    options: [
      'The ventricles are electrically silent between beats',
      'Every ventricular myocyte sits on its plateau at a similar voltage, so no current flows between regions',
      'Vagal tone suppresses electrical activity after the QRS',
      'The Purkinje fibers are refractory',
    ],
    answer: 1,
    explain:
      'During phase 2 — the plateau — inward L-type Ca²⁺ current balances outward K⁺ current and practically every ventricular cell holds the same potential. No voltage gradient, no net current, a flat line. Ischemic cells cannot hold the plateau; the “injury current” between healthy and injured myocardium is what pushes the ST segment up or down.',
    pearl: 'ST deviation is the earliest bedside window into ischemia because it measures a voltage gradient that should not exist.',
  },
  {
    id: 't-wave-direction',
    cat: 'physiology',
    q: 'Depolarization and repolarization carry opposite electrical signs. So why is the T wave usually upright wherever the QRS is upright?',
    options: [
      'The T wave reflects atrial repolarization',
      'Repolarization travels the opposite way — from epicardium to endocardium',
      'The ECG machine inverts the signal after the QRS',
      'Only the left ventricle repolarizes',
    ],
    answer: 1,
    explain:
      'Depolarization spreads from endocardium to epicardium. Epicardial cells have shorter action potentials, so they repolarize first: repolarization runs from epicardium to endocardium. A wave of opposite sign travelling in the opposite direction produces a deflection of the same polarity — a concordant T wave. When that gradient flips (ischemia, hypertrophy with strain, bundle branch block), T waves invert.',
    pearl: 'In bundle branch block a discordant ST–T is expected. A concordant one is a red flag.',
  },
  {
    id: 'avr-upright-p',
    cat: 'physiology',
    q: 'In sinus rhythm the P wave, QRS and T wave are all negative in aVR. What does an upright P wave in aVR most likely mean?',
    options: [
      'Right atrial enlargement',
      'Limb lead reversal — or, rarely, dextrocardia',
      'A normal variant in athletes',
      'Inferior myocardial infarction',
    ],
    answer: 1,
    explain:
      'aVR looks at the heart from the right shoulder. Normal atrial and ventricular activation travels down and to the left, away from aVR, so everything there is negative. An upright P in aVR together with a negative P and QRS in lead I suggests swapped arm electrodes. Dextrocardia produces the same limb-lead picture but also loses R-wave progression across V1–V6.',
    pearl: 'Before you diagnose anything, check lead I and aVR. Ten seconds of technique saves an afternoon of wrong conclusions.',
  },
  {
    id: 'axis-lead-ii',
    cat: 'physiology',
    q: 'Lead I is positive and aVF is negative. Which lead decides whether the axis is pathological?',
    options: [
      'aVR — if it is positive, the axis is normal',
      'Lead II — if it is negative, there is left axis deviation beyond −30°',
      'V1 — if it is positive, there is right axis deviation',
      'None — this is always left axis deviation',
    ],
    answer: 1,
    explain:
      'Positive I and negative aVF place the axis between 0° and −90°. Lead II sits at +60°, so its perpendicular is −30° — exactly the boundary you care about. If II is still positive, the axis lies between 0° and −30°: normal. If II is negative, the axis is beyond −30°: true left axis deviation, most often from left anterior fascicular block.',
    pearl: 'Two leads give you the quadrant; the third gives you the verdict.',
  },

  // ── Rhythm ──────────────────────────────────────────────────────────────
  {
    id: 'flutter-150',
    cat: 'rhythm',
    q: 'A regular narrow-complex tachycardia at exactly 150/min. What do you suspect first?',
    options: [
      'Sinus tachycardia',
      'Atrial flutter with 2:1 conduction',
      'Atrial fibrillation',
      'Ventricular tachycardia',
    ],
    answer: 1,
    explain:
      'Typical flutter is a macro-reentrant circuit around the tricuspid annulus that drives the atria at about 300/min. The AV node usually lets every second wave through, so the ventricles run at about 150/min. Flutter waves hide inside the QRS and T, so look for a sawtooth baseline in II, III and aVF and a second P-like bump in V1.',
    pearl: 'Regular, narrow, 150: flutter with 2:1 conduction until proven otherwise.',
  },
  {
    id: 'adenosine-flutter',
    cat: 'rhythm',
    q: 'You give adenosine for a regular narrow-complex tachycardia at 150/min. For a few seconds the ventricular rate drops and sawtooth waves at 300/min appear — then the tachycardia resumes. What happened?',
    options: [
      'Adenosine failed because the dose was too low',
      'Adenosine blocked the AV node and unmasked atrial flutter, which does not need the node to continue',
      'Adenosine converted the rhythm into AVNRT',
      'Adenosine revealed ventricular tachycardia',
    ],
    answer: 1,
    explain:
      'Adenosine acts on A1 receptors in the AV node, opening potassium channels and hyperpolarizing nodal cells: a transient AV block. Rhythms that use the node as part of their circuit (AVNRT, AVRT) terminate. Flutter lives entirely in the atrium, so it keeps going while the node is closed — and you finally see it. Its half-life is under 10 seconds: push fast, flush fast, and record a strip while you do it.',
    pearl: 'Adenosine is a drug and a diagnostic test in one syringe.',
  },
  {
    id: 'avnrt-p',
    cat: 'rhythm',
    q: 'Typical AVNRT at 180/min. Where are the P waves?',
    options: [
      'Before each QRS with a short PR interval',
      'Buried in or just after the QRS — a pseudo-r′ in V1',
      'Absent, because the atria are not activated',
      'Dissociated from the QRS complexes',
    ],
    answer: 1,
    explain:
      'In typical slow–fast AVNRT the impulse travels down the slow pathway and returns up the fast one. Atria and ventricles are activated almost simultaneously, so the retrograde P lands inside or at the tail of the QRS: a pseudo-r′ in V1 and pseudo-S waves in II, III and aVF. Compare with the patient’s sinus ECG — those notches disappear.',
    pearl: 'A notch that appears only during the tachycardia is a P wave in disguise.',
  },
  {
    id: 'preexcited-af',
    cat: 'rhythm',
    q: 'A 24-year-old has an irregular tachycardia at 240/min with broad QRS complexes that change shape from beat to beat. Which treatment is dangerous?',
    options: [
      'Procainamide',
      'Verapamil',
      'Synchronized cardioversion',
      'Ibutilide',
    ],
    answer: 1,
    explain:
      'Irregular, very fast and broad-but-variable means pre-excited atrial fibrillation (WPW). The accessory pathway lacks the AV node’s decremental brake and can conduct at well over 250/min. Blocking the node — verapamil, diltiazem, adenosine, beta-blockers, digoxin, IV amiodarone — sends even more impulses down the pathway and can trigger ventricular fibrillation. Unstable: synchronized cardioversion. Stable: procainamide or ibutilide, or elective cardioversion.',
    pearl: 'Irregular, broad and faster than any AF you have seen: keep your hands off the AV node.',
  },
  {
    id: 'vt-proof',
    cat: 'rhythm',
    q: 'Regular broad-complex tachycardia at 170/min in a 66-year-old with a previous myocardial infarction. Which finding proves ventricular tachycardia?',
    options: [
      'A QRS duration of 130 ms',
      'Left axis deviation',
      'AV dissociation with capture and fusion beats',
      'The patient is hemodynamically stable',
    ],
    answer: 2,
    explain:
      'When the ventricles drive the rhythm, the sinus node keeps firing on its own and P waves march through the QRS complexes: AV dissociation. Occasionally a sinus beat slips through the AV node in time to produce a narrow “capture” beat, or merges with a ventricular beat as a “fusion” beat. Both prove a ventricular origin. Stability proves nothing — VT can look deceptively well for a while.',
    pearl: 'Broad, regular, and a scar in the history: VT until proven otherwise. Most broad-complex tachycardias are.',
  },

  // ── Conduction ─────────────────────────────────────────────────────────
  {
    id: 'wenckebach-rr',
    cat: 'conduction',
    q: 'In classic Mobitz I (Wenckebach), why do the R–R intervals shorten just before the dropped beat?',
    options: [
      'The sinus rate speeds up',
      'The PR keeps lengthening, but by a smaller amount with each beat',
      'A junctional pacemaker takes over',
      'The QRS becomes narrower',
    ],
    answer: 1,
    explain:
      'The AV node conducts decrementally: each impulse arrives earlier in the node’s recovery and is slowed more. The biggest PR increment happens on the second beat of the cycle; after that the increments shrink. Because R–R equals P–P plus the change in PR, shrinking increments mean shortening R–R intervals — until one P wave fails to conduct and the node gets to rest.',
    pearl: 'Group beating, shortening R–R and a pause shorter than two P–P intervals: Wenckebach’s fingerprint.',
  },
  {
    id: 'mobitz-ii',
    cat: 'conduction',
    q: 'PR intervals are constant, then a P wave is suddenly not followed by a QRS. The QRS is 140 ms with RBBB morphology. Where is the block?',
    options: [
      'In the AV node — benign, observe',
      'Below the AV node, in the His–Purkinje system — high risk of complete block, pacing indicated',
      'In the sinus node — sinus exit block',
      'In the atria — a non-conducted premature atrial beat',
    ],
    answer: 1,
    explain:
      'Mobitz II is all-or-nothing. There is no warning PR prolongation because His–Purkinje tissue does not conduct decrementally. Combined with a bundle branch block, it signals disease in the remaining fascicles. It can progress abruptly to complete heart block with a slow, unreliable ventricular escape, which is why it is an indication for permanent pacing even without symptoms (once reversible causes are excluded).',
    pearl: 'Mobitz I warns you. Mobitz II does not.',
  },
  {
    id: 'two-to-one-atropine',
    cat: 'conduction',
    q: '2:1 AV block with a narrow QRS. After atropine, conduction improves to 3:2. What does that tell you?',
    options: [
      'The block is infranodal — pace immediately',
      'The block is most likely in the AV node',
      'Atropine has unmasked Mobitz II',
      'Nothing — atropine does not affect the AV node',
    ],
    answer: 1,
    explain:
      'With 2:1 block you cannot watch the PR evolve, so you need other clues. Atropine removes vagal tone from both the sinus node and the AV node. A nodal block improves. An infranodal block often gets worse, because a faster sinus rate bombards a His–Purkinje system that cannot keep up. A narrow QRS, a response to atropine and Wenckebach elsewhere on the strip all point to the node.',
    pearl: 'In 2:1 block the drug response is the diagnosis: better with atropine means node; worse means below it.',
  },
  {
    id: 'lbbb-septal-q',
    cat: 'conduction',
    q: 'Why does left bundle branch block remove the small septal q waves in I, V5 and V6?',
    options: [
      'The septum is infarcted',
      'The septum now depolarizes from right to left — toward the lateral leads',
      'The left ventricle depolarizes first',
      'The q wave is hidden by a taller R wave',
    ],
    answer: 1,
    explain:
      'Normally the left bundle fires first, so the septum depolarizes from left to right — a small vector away from the lateral leads, seen as a tiny q in I, aVL, V5 and V6. When the left bundle is blocked, the septum is activated from the right bundle instead, right to left. The first vector now points toward V6, the q disappears, and the lateral leads show a broad, notched R.',
    pearl: 'No septal q in the lateral leads plus a QRS of 120 ms or more: think LBBB first.',
  },
  {
    id: 'af-regularized',
    cat: 'conduction',
    q: 'A patient in permanent atrial fibrillation who takes digoxin now has a perfectly regular ventricular rate of 42/min. What is happening?',
    options: [
      'AF has converted to sinus bradycardia',
      'Complete heart block with an escape rhythm — suspect digoxin toxicity',
      'Rate control is finally optimal — continue the dose',
      'Atrial flutter with 4:1 conduction',
    ],
    answer: 1,
    explain:
      'AF conducted through the AV node is always irregularly irregular. A regular rhythm means the ventricles are no longer listening to the atria: the node is blocked and a junctional or ventricular escape has taken over. In a patient on digoxin that is toxicity until proven otherwise — check the level, potassium and renal function.',
    pearl: 'AF that suddenly turns regular is never a reason to relax.',
  },

  // ── Ischemia ───────────────────────────────────────────────────────────
  {
    id: 'wellens',
    cat: 'ischemia',
    q: 'A 52-year-old had chest pain yesterday. Today he is pain-free and troponin is normal. ECG: deep, symmetric T-wave inversion in V2–V3, preserved R waves, no Q waves. Next step?',
    options: [
      'Treadmill stress test',
      'Discharge with outpatient follow-up',
      'Urgent coronary angiography — this is Wellens’ syndrome',
      'Repeat ECG in six weeks',
    ],
    answer: 2,
    explain:
      'Wellens’ pattern — deep symmetric or biphasic T waves in V2–V3 in a pain-free patient — reflects reperfusion after a transient occlusion at a critical proximal LAD stenosis. The artery is open, for now. A stress test can precipitate an extensive anterior infarction. These patients need an invasive strategy.',
    pearl: 'Sometimes the most dangerous ECG is the one recorded after the pain has gone.',
  },
  {
    id: 'de-winter',
    cat: 'ischemia',
    q: 'Forty minutes of chest pain. V1–V6 show 1–3 mm upsloping ST depression at the J point running into tall, symmetric T waves; aVR shows slight ST elevation. No ST elevation in the precordial leads. Diagnosis?',
    options: [
      'Subendocardial ischemia — manage as NSTEMI',
      'Hyperkalemia',
      'De Winter T waves — acute proximal LAD occlusion',
      'Benign early repolarization',
    ],
    answer: 2,
    explain:
      'De Winter T waves are a STEMI equivalent seen in a small minority of acute proximal LAD occlusions. The mechanism is still debated, but the meaning is not: an occluded artery without classic ST elevation. Treat it like a STEMI and activate the cath lab.',
    pearl: 'No ST elevation does not mean no occlusion. Learn the equivalents.',
  },
  {
    id: 'posterior',
    cat: 'ischemia',
    q: 'Chest pain with ST depression in V1–V3, tall R waves and upright T waves. Which leads do you record next?',
    options: [
      'V3R and V4R',
      'V7–V9',
      'V1–V3 one intercostal space higher',
      'None — this is NSTEMI',
    ],
    answer: 1,
    explain:
      'V1–V3 face the anterior wall, so a posterior infarct appears there as a mirror image: ST depression instead of elevation, tall R waves instead of Q waves. V7–V9, placed on the back, look at the posterior wall directly. ST elevation of 0.5 mm or more in V7–V9 confirms a posterior STEMI, usually from the circumflex or the RCA.',
    pearl: 'Flip the strip and hold it to the light: anterior ST depression is often a posterior STEMI.',
  },
  {
    id: 'sgarbossa',
    cat: 'ischemia',
    q: 'Known left bundle branch block and chest pain. Which finding most strongly suggests acute myocardial infarction?',
    options: [
      'Discordant ST elevation of 2 mm in V1',
      'ST elevation of 1 mm or more concordant with the QRS',
      'A QRS duration of 160 ms',
      'Left axis deviation',
    ],
    answer: 1,
    explain:
      'In LBBB the ST segment normally points opposite to the main QRS deflection. Concordant ST elevation of at least 1 mm in any lead is the most specific Sgarbossa criterion. Concordant ST depression of at least 1 mm in V1–V3 also counts, and the Smith-modified rule flags discordant ST elevation that is excessive relative to the S wave (25% or more).',
    pearl: 'LBBB does not make the ECG unreadable. It makes it readable by a different rule.',
  },
  {
    id: 'pericarditis',
    cat: 'ischemia',
    q: 'Which pattern favors acute pericarditis over STEMI?',
    options: [
      'Convex ST elevation in II, III and aVF with ST depression in aVL',
      'Diffuse concave ST elevation with PR depression and PR elevation in aVR',
      'New Q waves',
      'ST elevation greater in III than in II',
    ],
    answer: 1,
    explain:
      'Pericardial inflammation injures the epicardium broadly, so ST elevation is diffuse instead of following one coronary territory, and there are no reciprocal changes except in aVR and V1. Atrial injury depresses the PR segment, mirrored as PR elevation in aVR. STEMI respects a territory, produces reciprocal depression and evolves Q waves.',
    pearl: 'Territory plus reciprocity means an artery. Everywhere plus PR depression means the pericardium.',
  },

  // ── Electrolytes & drugs ───────────────────────────────────────────────
  {
    id: 'hyperk-calcium',
    cat: 'electrolytes',
    q: 'Peaked T waves, a widening QRS, potassium 7.4 mmol/L. Why give IV calcium first, even though it does not lower potassium?',
    options: [
      'Calcium shifts potassium into the cells',
      'Calcium increases renal potassium excretion',
      'Calcium restores the gap between resting potential and threshold — it stabilizes the membrane',
      'Calcium antagonizes digoxin',
    ],
    answer: 2,
    explain:
      'High extracellular potassium makes the resting membrane potential less negative and brings it closer to threshold. Sodium channels partly inactivate, conduction slows (a wide QRS) and arrhythmias follow. Calcium raises the threshold potential and restores the safety margin within minutes, for about 30–60 minutes — time you use for insulin with glucose, beta-agonists and potassium removal.',
    pearl: 'Calcium protects the heart. Insulin moves potassium. Dialysis removes it. Three jobs, three treatments.',
  },
  {
    id: 'hypok-u',
    cat: 'electrolytes',
    q: 'Flattened T waves, ST depression and prominent U waves that make the QT look long. Most likely cause?',
    options: ['Hypercalcemia', 'Hypokalemia', 'Hyperkalemia', 'Hypothermia'],
    answer: 1,
    explain:
      'Low extracellular potassium slows repolarization: T waves flatten, U waves grow and the two merge into what looks like a long QT — really a long QU. It is arrhythmogenic, especially with digoxin or QT-prolonging drugs. Check magnesium too: potassium often will not correct until magnesium does.',
    pearl: 'If the T wave has a hump, decide where the T ends before you measure anything.',
  },
  {
    id: 'hypoca-st',
    cat: 'electrolytes',
    q: 'A long QT produced by a long, flat ST segment, with a normal-looking T wave. Which electrolyte?',
    options: ['Hypercalcemia', 'Hypocalcemia', 'Hypomagnesemia', 'Hyponatremia'],
    answer: 1,
    explain:
      'Calcium sets the length of the plateau (phase 2), which on the ECG is the ST segment. Low calcium prolongs the plateau: a long, flat ST and a long QT, with the T wave itself unchanged. High calcium shortens the plateau: short ST, short QT. Most other QT prolongers — drugs, hypokalemia — change the shape of the T wave instead.',
    pearl: 'Long ST with a normal T: think calcium. Long QT with a strange T: think drugs and potassium.',
  },
  {
    id: 'digoxin-bvt',
    cat: 'electrolytes',
    q: 'Which arrhythmia is classic for digoxin toxicity?',
    options: [
      'Bidirectional ventricular tachycardia',
      'Torsades de pointes',
      'Atrial fibrillation with a rapid ventricular response',
      'Pre-excitation (WPW pattern)',
    ],
    answer: 0,
    explain:
      'Digoxin inhibits the Na⁺/K⁺-ATPase, raising intracellular calcium (more automaticity, delayed afterdepolarizations) while increasing vagal tone (AV block). That combination produces signature rhythms: atrial tachycardia with block and bidirectional VT, in which the QRS axis alternates beat to beat (also seen in CPVT). The “reverse tick” ST depression is digoxin effect, not toxicity.',
    pearl: 'Increased automaticity and impaired conduction at the same time: suspect digoxin.',
  },
  {
    id: 'torsades-mg',
    cat: 'electrolytes',
    q: 'A patient on a macrolide antibiotic develops polymorphic VT twisting around the baseline. QTc before the event was 560 ms. First-line drug?',
    options: [
      'IV amiodarone',
      'IV magnesium sulfate',
      'IV procainamide',
      'IV sotalol',
    ],
    answer: 1,
    explain:
      'Torsades de pointes is triggered by early afterdepolarizations when repolarization is prolonged. IV magnesium (typically 2 g) suppresses those triggers even when serum magnesium is normal. Stop QT-prolonging drugs, bring potassium to high-normal, and if it recurs with bradycardia, raise the heart rate (isoprenaline or overdrive pacing) — a faster rate shortens the QT. Amiodarone, procainamide and sotalol all prolong the QT further.',
    pearl: 'Torsades: magnesium, potassium, speed it up — and never add another QT-prolonger.',
  },

  // ── Devices & mimics ───────────────────────────────────────────────────
  {
    id: 'undersensing',
    cat: 'devices',
    q: 'Pacing spikes appear just after the patient’s own QRS complexes, some landing on T waves. What is the problem?',
    options: ['Failure to capture', 'Undersensing', 'Oversensing', 'Normal pacemaker function'],
    answer: 1,
    explain:
      'The pacemaker did not “see” the intrinsic beats, so it fired as if nothing had happened: undersensing. Spikes then fall at odd moments, including on the T wave, which can trigger VF (R-on-T). Failure to capture is a spike with no complex after it. Oversensing is the opposite: the device mistakes noise for beats and withholds pacing, producing pauses.',
    pearl: 'Sensing is the pacemaker’s hearing. Capture is its voice. Work out which one failed.',
  },
  {
    id: 'magnet',
    cat: 'devices',
    q: 'A magnet is placed over a pacemaker, and separately over an ICD. What happens?',
    options: [
      'Both devices switch off',
      'The pacemaker paces asynchronously; the ICD suspends tachyarrhythmia therapy while bradycardia pacing continues',
      'The pacemaker switches off; the ICD delivers a shock',
      'Both switch to asynchronous pacing',
    ],
    answer: 1,
    explain:
      'On most pacemakers a magnet forces asynchronous pacing (VOO or DOO) at a fixed magnet rate — useful during surgery with diathermy. On an ICD a magnet suspends tachyarrhythmia detection and shocks but does not change bradycardia pacing. Remove the magnet and both return to their programmed behavior. Behavior varies by manufacturer, so confirm with the device team.',
    pearl: 'A magnet on an ICD means “don’t shock”, not “pace”.',
  },
  {
    id: 'brugada-fever',
    cat: 'devices',
    q: 'A 32-year-old with a temperature of 39.5 °C. V1–V2 show coved ST elevation of 2 mm or more descending into a negative T wave. Which statement is correct?',
    options: [
      'It is an anterior STEMI — activate the cath lab',
      'Fever can unmask a type 1 Brugada pattern — a marker of risk for ventricular fibrillation',
      'It is benign early repolarization',
      'It is right bundle branch block — no action needed',
    ],
    answer: 1,
    explain:
      'Brugada syndrome is a sodium-channel disorder (often SCN5A). Reduced sodium current exaggerates the voltage gradient across the right ventricular outflow tract, producing the coved type 1 pattern in V1–V2. Fever and sodium-channel blockers weaken the current further and unmask it. Treat the fever aggressively, avoid sodium-channel blockers and refer to electrophysiology.',
    pearl: 'Fever plus a coved V1: bring the temperature down and call the electrophysiologist.',
  },
  {
    id: 'osborn',
    cat: 'devices',
    q: 'Core temperature 29 °C. A positive notch at the J point, most visible in V3–V6. What is it?',
    options: [
      'Delta wave — pre-excitation',
      'Osborn (J) wave — hypothermia',
      'Epsilon wave — arrhythmogenic cardiomyopathy',
      'Type 1 Brugada pattern',
    ],
    answer: 1,
    explain:
      'Osborn waves are J-point deflections that grow as the temperature falls. They reflect a transient outward potassium current that is stronger in the epicardium than in the endocardium and is exaggerated by cold. Expect bradycardia, prolonged intervals, shivering artifact and — below about 30 °C — a rising risk of ventricular fibrillation.',
    pearl: 'A notch at the J point in a cold patient: warm first, interpret second.',
  },
  {
    id: 'pe-ecg',
    cat: 'devices',
    q: 'What is the most common ECG finding in acute pulmonary embolism?',
    options: ['S1Q3T3', 'Sinus tachycardia', 'Right bundle branch block', 'Right axis deviation'],
    answer: 1,
    explain:
      'S1Q3T3 is famous but appears in a minority of patients. Sinus tachycardia is the most frequent finding, followed by T-wave inversion in V1–V4 and III, reflecting right ventricular strain. A normal ECG never excludes PE: the ECG helps you sense a strained right ventricle; it does not make the diagnosis.',
    pearl: 'In PE the ECG is a severity marker, not a test.',
  },
];
