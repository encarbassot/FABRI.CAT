const langBtns = Array.from(document.querySelectorAll('#lang-selector button'));

// Map browser codes to your supported keys
const SUPPORTED = ['cat', 'es', 'en'];
const MAP = { ca: 'cat', es: 'es', en: 'en' };

function getBrowserPreferredLang() {
  const list = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || navigator.userLanguage || 'en'];
  // Try exact -> base fallback -> default
  for (const raw of list) {
    const code = String(raw).toLowerCase();
    const base = code.split('-')[0];
    if (MAP[base]) return MAP[base];
  }
  return 'cat'; // default
}

function applyI18n(lang) {
  // show only the nodes for the current language
  const all = document.querySelectorAll('[data-lang]');
  all.forEach(el => {
    const show = el.getAttribute('data-lang') === lang;
    el.toggleAttribute('hidden', !show);
    el.setAttribute('aria-hidden', String(!show));
  });
}

function selectLang(lang = 'cat') {
  if (!SUPPORTED.includes(lang)) lang = 'cat';

  document.documentElement.lang = (lang === 'cat') ? 'ca' : lang;

  langBtns.forEach(btn => {
    const active = btn.getAttribute('data-lang-btn') === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });

  applyI18n(lang);
  localStorage.setItem('preferredLang', lang);
}

// initial call remains the same in your code


langBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedLang = btn.getAttribute('data-lang-btn');
    selectLang(selectedLang);
  });
});

// Initial load: use saved value or browser preference
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('preferredLang');
  const initial = savedLang || getBrowserPreferredLang();
  selectLang(initial);
});

// Keep multiple tabs/windows in sync
window.addEventListener('storage', (e) => {
  if (e.key === 'preferredLang' && e.newValue) {
    selectLang(e.newValue);
  }
});
