/* ── Nav search ───────────────────────────── */
const SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';

function initNavSearch() {
  if (/\/admin\.html$/i.test(window.location.pathname) || document.getElementById('admin-body')) return;
  const nav = document.getElementById('nav');
  const navEnd = document.querySelector('.nav-end');
  if (!nav || !navEnd) return;

  let btn = document.getElementById('nav-search-btn');
  if (!btn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'nav-search-btn';
    btn.className = 'nav-search';
    btn.setAttribute('aria-label', 'جستجو');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'search-panel');
    btn.innerHTML = SEARCH_SVG;
    const cart = navEnd.querySelector('.nav-cart');
    if (cart) navEnd.insertBefore(btn, cart);
    else navEnd.appendChild(btn);
  }

  let panel = document.getElementById('search-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'search-panel';
    panel.className = 'search-panel';
    panel.setAttribute('role', 'search');
    panel.innerHTML = `
      <div class="search-panel-inner">
        <div class="search-input-wrap">
          <input type="search" class="search-input" placeholder="جستجوی محصول، مجموعه یا جنس..." autocomplete="off" aria-label="جستجو" />
          <span class="search-input-icon">${SEARCH_SVG}</span>
        </div>
        <p class="search-hint">نام محصول یا مجموعه را وارد کنید</p>
        <div class="search-results" aria-live="polite"></div>
      </div>`;
    nav.insertAdjacentElement('afterend', panel);
  }

  if (btn.dataset.bound) return;
  btn.dataset.bound = '1';

  const input = panel.querySelector('.search-input');
  const results = panel.querySelector('.search-results');
  const hint = panel.querySelector('.search-hint');

  function closeSearch() {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');
    input.value = '';
    results.innerHTML = '';
    if (hint) hint.style.display = '';
  }

  function openSearch() {
    const links = document.getElementById('nav-links');
    const toggle = document.getElementById('nav-toggle');
    if (links?.classList.contains('open')) {
      links.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
    btn.classList.add('active');
    btn.setAttribute('aria-expanded', 'true');
    panel.classList.add('open');
    setTimeout(() => input.focus(), 80);
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.contains('open') ? closeSearch() : openSearch();
  });

  function runSearch(query) {
    const q = query.trim();
    if (!q) {
      results.innerHTML = '';
      if (hint) hint.style.display = '';
      return;
    }
    if (hint) hint.style.display = 'none';
    const matches = Products.getAllFlat().filter(p =>
      (p.name && p.name.includes(q)) ||
      (p.collectionName && p.collectionName.includes(q)) ||
      (p.material && p.material.includes(q))
    ).slice(0, 12);

    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">نتیجه‌ای یافت نشد</p>';
      return;
    }

    results.innerHTML = matches.map(p => `
      <button type="button" class="search-result-item" data-id="${escHtml(p.id)}" data-coll="${escHtml(p.collection)}">
        <div>
          <div class="search-result-name">${escHtml(p.name)}</div>
          <div class="search-result-meta">${escHtml(p.collectionName || '')} · ${escHtml(p.material || '')}</div>
        </div>
        <span class="search-result-price">${escHtml(formatPrice(p.price))}</span>
      </button>`).join('');

    results.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        closeSearch();
        navigateToProduct(el.dataset.id, el.dataset.coll);
      });
    });
  }

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => runSearch(input.value), 180);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closeSearch();
  });

  document.addEventListener('click', e => {
    if (!panel.classList.contains('open')) return;
    if (e.target.closest('#search-panel') || e.target.closest('#nav-search-btn')) return;
    closeSearch();
  });
}

