// "The heart is an orchestra" — scroll story. `seg` maps to the highlighted
// part of the ECG complex and `node` to the conduction-system diagram.
export default [
  {
    seg: 'p',
    node: 'sa',
    label: 'P wave · < 120 ms',
    title: 'The sinus node conducts.',
    body:
      'Every beat starts with a few thousand pacemaker cells high in the right atrium. Their impulse spreads across both atria: the P wave. Upright in II, inverted in aVR — that is what “sinus” means on paper.',
    clinic: 'No P waves and an irregular rhythm? Someone else has taken the baton: atrial fibrillation.',
  },
  {
    seg: 'pr',
    node: 'av',
    label: 'PR interval · 120–200 ms',
    title: 'The AV node keeps time.',
    body:
      'The impulse slows down on purpose. Calcium-driven nodal cells hold it for about a tenth of a second, so the atria can finish filling the ventricles. On the ECG it looks like nothing. In the patient it is everything.',
    clinic: 'Longer than 200 ms: first-degree AV block. Getting longer until a beat drops: Wenckebach.',
  },
  {
    seg: 'qrs',
    node: 'his',
    label: 'QRS complex · < 120 ms',
    title: 'His–Purkinje is the highway.',
    body:
      'Through the bundle of His, down both bundle branches and into the Purkinje network at up to 4 meters per second. The whole ventricular mass fires in under a tenth of a second — which is why a normal QRS is narrow.',
    clinic: 'QRS of 120 ms or more: a blocked bundle, or a beat that started in the ventricle itself.',
  },
  {
    seg: 'st',
    node: 'plateau',
    label: 'ST segment · isoelectric',
    title: 'The plateau holds the note.',
    body:
      'Every ventricular cell now sits at the same voltage, balanced between calcium flowing in and potassium flowing out. No gradient, no current: a flat line. Which is exactly why ischemia, which breaks that balance, shows up here first.',
    clinic: 'ST elevation in a territory with reciprocal depression: an occluded artery until proven otherwise.',
  },
  {
    seg: 't',
    node: 'repol',
    label: 'T wave · QTc < 450–460 ms',
    title: 'Repolarization resets the stage.',
    body:
      'The ventricles recover from the outside in, so the T wave usually points the same way as the QRS. The QT measures the whole performance — and when it runs long, the next beat can start too early.',
    clinic: 'QTc above 500 ms: stop QT-prolonging drugs, check potassium and magnesium.',
  },
];
