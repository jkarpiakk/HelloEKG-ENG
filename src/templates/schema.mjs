// JSON-LD @graph for the home page. Everything here mirrors visible content.
export function homeSchema({ cfg, page, heroCase, questions, faq, curriculum }) {
  const o = cfg.origin;
  const org = {
    '@type': 'Organization',
    '@id': `${o}/#org`,
    name: 'helloEKG',
    url: `${o}/`,
    logo: { '@type': 'ImageObject', url: `${o}/assets/img/logo-512.png`, width: 512, height: 512 },
    email: cfg.contactEmail,
    sameAs: [cfg.instagram, ...cfg.alternates.map((a) => a.href)],
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${o}/#website`,
    url: `${o}/`,
    name: 'helloEKG',
    inLanguage: 'en',
    publisher: { '@id': `${o}/#org` },
  };
  const webpage = {
    '@type': ['WebPage', 'MedicalWebPage'],
    '@id': `${o}/#webpage`,
    url: `${o}/`,
    name: page.title,
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': `${o}/#website` },
    about: {
      '@type': 'MedicalTest',
      name: 'Electrocardiography',
      alternateName: ['ECG', 'EKG', '12-lead ECG interpretation'],
    },
    audience: [
      { '@type': 'MedicalAudience', audienceType: 'Clinician' },
      { '@type': 'EducationalAudience', educationalRole: 'student' },
    ],
    lastReviewed: cfg.lastReviewed,
    dateModified: cfg.lastReviewed,
    primaryImageOfPage: { '@type': 'ImageObject', url: `${o}/assets/img/og-image.png` },
    mainEntity: { '@id': `${o}/#course` },
  };
  const course = {
    '@type': 'Course',
    '@id': `${o}/#course`,
    name: 'helloEKG — Online ECG Interpretation Course',
    description:
      'An online ECG (EKG) interpretation course that starts from cardiac physiology: visual lessons, explained questions and clinical cases for medical students, junior doctors, paramedics and nurses.',
    url: `${o}/`,
    inLanguage: 'en',
    provider: { '@id': `${o}/#org` },
    educationalLevel: 'Undergraduate and postgraduate medical education',
    coursePrerequisites: 'Basic human anatomy and physiology',
    educationalCredentialAwarded: 'Certificate of completion',
    teaches: [
      'Systematic 12-lead ECG interpretation',
      'Cardiac conduction physiology',
      'Arrhythmia recognition',
      'AV and bundle branch blocks',
      'STEMI, STEMI equivalents and infarct localization',
      'Electrolyte and drug effects on the ECG',
      'Pacemaker and ICD ECGs',
    ],
    syllabusSections: curriculum.map((m) => ({
      '@type': 'Syllabus',
      name: `Module ${m.n}: ${m.title}`,
      description: m.lessons.join('; '),
    })),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      courseWorkload: `PT${cfg.facts.hours}H`,
      inLanguage: 'en',
    },
  };
  const toQuestion = (q, i) => ({
    '@type': 'Question',
    '@id': `${o}/#q-${q.id}`,
    eduQuestionType: 'Multiple choice',
    learningResourceType: 'Practice problem',
    position: i + 1,
    name: q.q,
    text: q.q,
    suggestedAnswer: q.options
      .map((t, k) => ({ t, k }))
      .filter(({ k }) => k !== q.answer)
      .map(({ t, k }) => ({ '@type': 'Answer', position: k, text: t })),
    acceptedAnswer: {
      '@type': 'Answer',
      position: q.answer,
      text: q.options[q.answer],
      answerExplanation: { '@type': 'Comment', text: `${q.explain} ${q.pearl}` },
    },
  });
  const heroQ = {
    id: heroCase.id,
    q: `${heroCase.headline.join(' ')} ${heroCase.vignette} ${heroCase.question}`,
    options: heroCase.options,
    answer: heroCase.answer,
    explain: heroCase.sections.map((s) => s.body).join(' '),
    pearl: heroCase.pearl,
  };
  const quiz = {
    '@type': 'Quiz',
    '@id': `${o}/#challenge`,
    name: 'The helloEKG ECG Challenge',
    description: 'A free ECG interpretation quiz: one clinical case and 30 physiology-based questions with explanations.',
    inLanguage: 'en',
    educationalLevel: 'Medical students, junior doctors, paramedics, nurses',
    about: { '@type': 'Thing', name: 'ECG interpretation' },
    provider: { '@id': `${o}/#org` },
    hasPart: [heroQ, ...questions].map(toQuestion),
  };
  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${o}/#faq`,
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return { '@context': 'https://schema.org', '@graph': [org, website, webpage, course, quiz, faqPage] };
}
