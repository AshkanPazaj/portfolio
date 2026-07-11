/* ── Mobile nav ───────────────────────────── */
function initMobileNav() {
  const nav = document.getElementById('nav');
  const links = document.getElementById('nav-links');
  if (!nav || !links) return;
  let toggle = document.getElementById('nav-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'nav-toggle';
    toggle.id = 'nav-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'nav-links');
    toggle.setAttribute('aria-label', 'باز کردن منو');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(toggle);
  }
  if (toggle.dataset.bound) return;
  toggle.dataset.bound = '1';
  toggle.addEventListener('click', () => {
    const searchPanel = document.getElementById('search-panel');
    const searchBtn = document.getElementById('nav-search-btn');
    if (searchPanel?.classList.contains('open')) {
      searchPanel.classList.remove('open');
      searchBtn?.classList.remove('active');
      searchBtn?.setAttribute('aria-expanded', 'false');
      const si = searchPanel.querySelector('.search-input');
      const sr = searchPanel.querySelector('.search-results');
      if (si) si.value = '';
      if (sr) sr.innerHTML = '';
    }
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    links.classList.toggle('open', !open);
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      links.classList.remove('open');
    });
  });
  document.addEventListener('click', e => {
    if (!links.classList.contains('open')) return;
    if (e.target.closest('#nav')) return;
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
  });
}

