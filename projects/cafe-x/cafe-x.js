(function () {
  const nav = document.getElementById('cafe-nav');
  const toggle = document.querySelector('.cafe-nav-toggle');
  const menu = document.getElementById('cafe-nav-menu');
  const year = document.getElementById('cafe-year');
  const track = document.getElementById('cafe-promo-track');
  const slides = track ? Array.from(track.querySelectorAll('.cafe-promo-slide')) : [];
  const dots = Array.from(document.querySelectorAll('.cafe-promo-dot'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let slideIndex = 0;
  let slideTimer;

  if (year) year.textContent = new Date().getFullYear();

  function scrollBehavior() {
    return prefersReducedMotion ? 'auto' : 'smooth';
  }

  function scrollToElement(el, behavior) {
    if (!el) return;
    const navHeight = nav ? nav.offsetHeight : 88;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top: Math.max(0, top), behavior: behavior || scrollBehavior() });
  }

  function scrollToHash(hash, behavior) {
    if (!hash || hash.length <= 1) return;
    const target = document.querySelector(hash);
    if (target) scrollToElement(target, behavior);
  }

  function currentPageName() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function setNavSolid() {
    if (!nav) return;
    const alwaysSolid = Boolean(document.querySelector('.cafe-form-page'));
    nav.classList.toggle('is-solid', alwaysSolid || window.scrollY > 48);
  }

  function showSlide(index) {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === slideIndex));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === slideIndex);
      dot.setAttribute('aria-selected', String(i === slideIndex));
    });
  }

  function startCarousel() {
    clearInterval(slideTimer);
    if (prefersReducedMotion || slides.length < 2) return;
    slideTimer = setInterval(() => showSlide(slideIndex + 1), 6000);
  }

  function closeMobileNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && nav && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeMobileNav();
    });
  }

  document.querySelectorAll('a[href*="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const hash = href.slice(hashIndex);
      if (hash.length <= 1) return;

      const linkPath = href.slice(0, hashIndex);
      const page = currentPageName();
      const targetPage = linkPath || page;

      if (targetPage === page) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          closeMobileNav();
          history.pushState(null, '', hash);
          scrollToElement(target);
        }
      }
    });
  });

  function handleInitialHash() {
    if (!window.location.hash) return;
    requestAnimationFrame(() => {
      scrollToHash(window.location.hash, 'auto');
    });
  }

  window.addEventListener('hashchange', () => {
    scrollToHash(window.location.hash);
  });

  window.addEventListener('load', handleInitialHash);
  if (document.readyState === 'complete') handleInitialHash();

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.slide));
      startCarousel();
    });
  });

  window.addEventListener('scroll', setNavSolid, { passive: true });
  setNavSolid();
  startCarousel();
})();
