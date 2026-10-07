// Progressive enhancement for every form[data-signup] (also ones injected
// later by the quiz): validate, POST JSON to /api/subscribe.php, show status.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const loadedAt = Date.now();

function setStatus(form, msg, kind) {
  const s = form.querySelector('.signup__status');
  s.textContent = msg;
  s.className = `signup__status ${kind ? `is-${kind}` : ''}`;
}

async function submit(form) {
  const input = form.querySelector('input[type="email"]');
  const btn = form.querySelector('button[type="submit"]');
  const email = input.value.trim();
  if (!EMAIL.test(email)) {
    input.setAttribute('aria-invalid', 'true');
    setStatus(form, 'That address looks incomplete — check it?', 'err');
    input.focus();
    return;
  }
  input.removeAttribute('aria-invalid');
  // Static preview (no PHP backend): show what would happen, send nothing.
  if (window.__HEKG_PREVIEW__) {
    form.classList.add('is-done');
    setStatus(form, `Preview only — on helloekg.com this sends a confirmation email to ${email}.`, 'ok');
    return;
  }
  btn.disabled = true;
  setStatus(form, 'Sending…');
  const data = Object.fromEntries(new FormData(form));
  data.email = email;
  data.t = Date.now() - loadedAt;
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || 'Request failed');
    form.classList.add('is-done');
    setStatus(
      form,
      json.status === 'confirmed'
        ? 'You are already on the list — see you on Tuesday.'
        : 'Check your inbox and click the confirmation link. That is it.',
      'ok'
    );
    document.querySelectorAll('form[data-signup]').forEach((f) => {
      if (f !== form) f.dataset.joined = '1';
    });
  } catch (e) {
    btn.disabled = false;
    setStatus(form, e.message === 'rate' ? 'Too many attempts — try again in a few minutes.' : 'Something went wrong. Try again in a moment.', 'err');
  }
}

export function mountSignup() {
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-signup]');
    if (!form) return;
    e.preventDefault();
    submit(form);
  });
  document.addEventListener('input', (e) => {
    if (e.target.matches('form[data-signup] input[type="email"]')) e.target.removeAttribute('aria-invalid');
  });
}
