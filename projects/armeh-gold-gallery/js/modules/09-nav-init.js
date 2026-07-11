/* ── Nav init ─────────────────────────────── */
const NAV_ICONS = {
  collections: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  women: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M12 12v10"/><path d="M8 18h8"/></svg>',
  men: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="14" r="5"/><path d="M19 5l-5.5 5.5"/><path d="M15 5h4v4"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  about: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  login: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
};

function addNavIcon(link, icon) {
  if (!link || link.querySelector('svg')) return;
  link.classList.add('nav-icon-link');
  link.insertAdjacentHTML('afterbegin', icon);
}

function isNavHomeLink(a) {
  if (!a) return false;
  const text = a.textContent.trim();
  const href = a.getAttribute('href') || '';
  if (text === 'خانه') return true;
  return /^(?:\.\.\/)?index\.html$/.test(href);
}

function ensureNavHomePosition() {
  const links = document.getElementById('nav-links');
  if (!links) return;
  const homeLi = [...links.querySelectorAll(':scope > li')].find(li => isNavHomeLink(li.querySelector(':scope > a')));
  if (!homeLi) return;
  homeLi.id = 'nav-home-li';
  if (links.firstElementChild !== homeLi) links.prepend(homeLi);
}

function ensureNavGenderLinks() {
  const links = document.getElementById('nav-links');
  if (!links || links.querySelector('a[href*="women.html"]')) return;
  const inCollections = window.location.pathname.includes('/collections/');
  const base = inCollections ? '../' : '';
  const anchor = links.querySelector('a[href*="collections"]')?.parentElement
    || links.querySelector('a[href="#collections"]')?.parentElement;
  const womenLi = document.createElement('li');
  womenLi.id = 'nav-women-li';
  womenLi.innerHTML = `<a href="${base}women.html">زنانه</a>`;
  const menLi = document.createElement('li');
  menLi.id = 'nav-men-li';
  menLi.innerHTML = `<a href="${base}men.html">مردانه</a>`;
  if (anchor) {
    anchor.insertAdjacentElement('afterend', menLi);
    anchor.insertAdjacentElement('afterend', womenLi);
  } else {
    links.insertBefore(menLi, links.firstChild);
    links.insertBefore(womenLi, links.firstChild);
  }
}

function initNav() {
  ensureNavGenderLinks();
  ensureNavHomePosition();
  Cart.updateBadge();
  const s       = Auth.getSession();
  const loginLi  = document.getElementById('nav-login-li');
  const adminLi  = document.getElementById('nav-admin-li');
  const logoutLi = document.getElementById('nav-logout-li');

  document.querySelectorAll('#nav-links > li > a').forEach(link => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent.trim();
    if (href.includes('women.html') || text === 'زنانه') addNavIcon(link, NAV_ICONS.women);
    else if (href.includes('men.html') || text === 'مردانه') addNavIcon(link, NAV_ICONS.men);
    else if (href.includes('#collections') || text === 'مجموعه‌ها') addNavIcon(link, NAV_ICONS.collections);
    else if (isNavHomeLink(link)) addNavIcon(link, NAV_ICONS.home);
    else if (href.includes('#about') || text === 'درباره ما') addNavIcon(link, NAV_ICONS.about);
  });

  if (loginLi) {
    loginLi.hidden = !!s;
    loginLi.style.removeProperty('display');
    addNavIcon(loginLi.querySelector('a'), NAV_ICONS.login);
  }
  if (adminLi) {
    adminLi.hidden = s?.role !== 'admin';
    adminLi.style.removeProperty('display');
  }
  if (logoutLi) {
    logoutLi.hidden = !s;
    logoutLi.style.removeProperty('display');
  }
  const profileLink = document.getElementById('nav-profile-link');
  if (profileLink) {
    const showProfile = s?.role === 'user';
    profileLink.style.display = showProfile ? '' : 'none';
    if (showProfile) profileLink.textContent = s.name;
  }
}

