// Case 01 and the ECG Challenge. The questions live in the HTML (crawlable,
// readable without JS); this script only adds the interaction.

const CHECK = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CROSS = '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
const pad = (n) => String(n).padStart(2, '0');

// Marks a question as answered. Returns true when the pick was correct.
function answer(scope, pick) {
  const right = Number(scope.dataset.answer);
  const opts = [...scope.querySelectorAll('.opt')];
  scope.classList.add('is-answered');
  opts.forEach((b, i) => {
    b.disabled = true;
    b.setAttribute('aria-disabled', 'true');
    if (i === right) { b.classList.add('is-right'); b.querySelector('.opt__mark').innerHTML = CHECK; }
    if (i === pick) {
      b.classList.add('is-picked');
      b.setAttribute('aria-pressed', 'true');
      if (i !== right) b.querySelector('.opt__mark').innerHTML = CROSS;
    }
  });
  const ex = scope.querySelector('.explain');
  if (ex) ex.open = true;
  return pick === right;
}

export function mountCase(root) {
  const verdict = root.querySelector('[data-verdict]');
  root.querySelectorAll('.opt').forEach((b) =>
    b.addEventListener('click', () => {
      if (root.classList.contains('is-answered')) return;
      const ok = answer(root, Number(b.dataset.i));
      verdict.textContent = ok ? verdict.dataset.right : verdict.dataset.wrong;
      const ex = root.querySelector('.opts');
      setTimeout(() => ex.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 120);
      try { sessionStorage.setItem('hekg-case', ok ? '1' : '0'); } catch { /* storage unavailable */ }
    })
  );
}

export function mountChallenge(root) {
  const deck = root.querySelector('[data-deck]');
  const all = [...deck.querySelectorAll('.q')];
  const nav = root.querySelector('[data-quiz-nav]');
  const next = root.querySelector('[data-next]');
  const prev = root.querySelector('[data-prev]');
  const pos = root.querySelector('[data-quiz-pos]');
  const scoreEl = root.querySelector('[data-quiz-score]');
  const bar = root.querySelector('[data-quiz-progress]');
  const modeBtn = root.querySelector('[data-quiz-mode]');
  const filters = [...root.querySelectorAll('[data-filter] .chip')];
  const tplGate = root.querySelector('[data-tpl-gate]');
  const tplResult = root.querySelector('[data-tpl-result]');
  const labels = Object.fromEntries(filters.map((f) => [f.dataset.cat, f.firstChild.textContent.trim()]));

  const results = new Map(); // id → boolean
  let list = all;
  let idx = 0;
  let gateShown = false;
  let overlay = null;

  nav.hidden = false;

  function score() { return [...results.values()].filter(Boolean).length; }

  function updateStatus() {
    const answered = list.filter((q) => results.has(q.id)).length;
    pos.textContent = `${pad(Math.min(idx + 1, list.length))} / ${pad(list.length)}`;
    scoreEl.textContent = `${score()} correct`;
    bar.style.width = `${(answered / list.length) * 100}%`;
    const cur = list[idx];
    next.disabled = !cur || !results.has(cur.id);
    prev.disabled = idx === 0;
    next.firstChild.textContent = idx === list.length - 1 ? 'See my result ' : 'Next question ';
  }

  function clearOverlay() { if (overlay) { overlay.remove(); overlay = null; } }

  function show(i) {
    clearOverlay();
    idx = Math.max(0, Math.min(list.length - 1, i));
    all.forEach((q) => q.classList.remove('is-current'));
    const q = list[idx];
    q.classList.add('is-current');
    q.querySelector('.q__num').textContent = `${pad(idx + 1)} / ${pad(list.length)}`;
    nav.hidden = false;
    updateStatus();
  }

  function focusTop() {
    const top = root.getBoundingClientRect().top;
    if (top < 0 || top > innerHeight * 0.4) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function gate() {
    gateShown = true;
    all.forEach((q) => q.classList.remove('is-current'));
    overlay = tplGate.content.firstElementChild.cloneNode(true);
    overlay.querySelector('[data-gate-score]').textContent = `${score()} for 10`;
    overlay.querySelector('[data-gate-skip]').addEventListener('click', () => { show(idx + 1); focusTop(); });
    deck.after(overlay);
    nav.hidden = true;
    root.dispatchEvent(new CustomEvent('quiz:overlay', { bubbles: true, detail: overlay }));
  }

  function result() {
    all.forEach((q) => q.classList.remove('is-current'));
    clearOverlay();
    overlay = tplResult.content.firstElementChild.cloneNode(true);
    const s = list.filter((q) => results.get(q.id)).length;
    const pct = s / list.length;
    overlay.querySelector('[data-result-score]').textContent = s;
    overlay.querySelector('[data-result-total]').textContent = list.length;
    overlay.querySelector('[data-result-msg]').textContent =
      pct >= 0.85 ? 'Cardiology registrar energy. The full course will still surprise you.'
        : pct >= 0.6 ? 'Solid foundations. The gaps are exactly where the physiology gets interesting.'
          : pct >= 0.35 ? 'A good start — and a clear map of what to learn next.'
            : 'Every expert started here. Now you know which waves to make friends with first.';
    const bars = overlay.querySelector('[data-result-bars]');
    const cats = [...new Set(list.map((q) => q.dataset.cat))];
    cats.forEach((c) => {
      const qs = list.filter((q) => q.dataset.cat === c);
      const ok = qs.filter((q) => results.get(q.id)).length;
      const row = document.createElement('div');
      row.className = 'result__bar';
      row.innerHTML = `<span></span><div class="progress"><span></span></div><b>${ok}/${qs.length}</b>`;
      row.firstChild.textContent = labels[c] || c;
      row.querySelector('.progress span').style.setProperty('--w', `${(ok / qs.length) * 100}%`);
      bars.append(row);
    });
    overlay.querySelectorAll('input[name="score"]').forEach((i) => (i.value = `${s}/${list.length}`));
    overlay.querySelector('[data-restart]').addEventListener('click', restart);
    deck.after(overlay);
    nav.hidden = true;
    bar.style.width = '100%';
    root.dispatchEvent(new CustomEvent('quiz:overlay', { bubbles: true, detail: overlay }));
  }

  function restart() {
    results.clear();
    all.forEach(resetQ);
    gateShown = false;
    show(0);
    focusTop();
  }

  function resetQ(q) {
    q.classList.remove('is-answered');
    q.querySelectorAll('.opt').forEach((b) => {
      b.disabled = false;
      b.removeAttribute('aria-disabled');
      b.removeAttribute('aria-pressed');
      b.classList.remove('is-right', 'is-picked');
      b.querySelector('.opt__mark').innerHTML = '';
    });
    const ex = q.querySelector('.explain');
    if (ex) ex.open = false;
  }

  all.forEach((q) => {
    q.querySelectorAll('.opt').forEach((b) =>
      b.addEventListener('click', () => {
        if (results.has(q.id)) return;
        results.set(q.id, answer(q, Number(b.dataset.i)));
        updateStatus();
        if (!root.classList.contains('is-list')) next.focus({ preventScroll: true });
      })
    );
  });

  next.addEventListener('click', () => {
    const atEnd = idx >= list.length - 1;
    if (atEnd) return result();
    if (!gateShown && list === all && idx === 9) return gate();
    show(idx + 1);
    focusTop();
  });
  prev.addEventListener('click', () => { show(idx - 1); focusTop(); });

  filters.forEach((f) =>
    f.addEventListener('click', () => {
      filters.forEach((x) => x.setAttribute('aria-pressed', String(x === f)));
      const c = f.dataset.cat;
      list = c === 'all' ? all : all.filter((q) => q.dataset.cat === c);
      all.forEach((q) => (q.hidden = !list.includes(q)));
      const firstOpen = list.findIndex((q) => !results.has(q.id));
      show(firstOpen === -1 ? 0 : firstOpen);
    })
  );

  modeBtn.addEventListener('click', () => {
    const on = root.classList.toggle('is-list');
    modeBtn.setAttribute('aria-pressed', String(on));
    modeBtn.textContent = on ? 'One at a time' : 'View all';
    if (on) clearOverlay(); else show(idx);
  });

  // Deep link: /#q-wellens opens that question.
  const hash = decodeURIComponent(location.hash.slice(1));
  const target = all.findIndex((q) => q.id === hash);
  show(target > -1 ? target : 0);
}
