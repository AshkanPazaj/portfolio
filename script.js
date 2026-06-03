/* ============================================
   Ashkan Pazaj — Portfolio Scripts
   ============================================ */

// ── Intro splash (once per session) ──────────────────────────
;(() => {
  const splash    = document.getElementById('introSplash');
  const logoImg   = document.getElementById('introLogoImg');
  if (!splash || !logoImg) return;

  // Skip on repeat visits within the same session
  if (sessionStorage.getItem('ap_intro_seen')) {
    splash.classList.add('gone');
    return;
  }

  // Lock scroll while splash is up
  document.documentElement.style.overflow = 'hidden';

  setTimeout(() => {
    const navLogo = document.querySelector('.nav-logo .logo-img');
    if (!navLogo) {
      splash.style.transition = 'opacity 0.6s ease';
      splash.style.opacity    = '0';
      setTimeout(() => {
        splash.classList.add('gone');
        document.documentElement.style.overflow = '';
        sessionStorage.setItem('ap_intro_seen', '1');
      }, 650);
      return;
    }

    // Hide the real nav logo — the splash logo will visibly travel to its spot
    navLogo.style.opacity = '0';

    // Cancel the CSS entry animation so it doesn't interfere with the slide
    logoImg.style.animation = 'none';

    // Snapshot the current center position AFTER killing the animation
    const from  = logoImg.getBoundingClientRect();
    const to    = navLogo.getBoundingClientRect();
    const dx    = (to.left + to.width  / 2) - (from.left + from.width  / 2);
    const dy    = (to.top  + to.height / 2) - (from.top  + from.height / 2);
    const scale = to.width / from.width;

    // Double rAF: first frame registers the current (no-transform) state,
    // second frame applies the transition so the browser actually animates it
    requestAnimationFrame(() => {
      logoImg.style.transition = 'transform 1.4s cubic-bezier(0.55, 0, 0.2, 1)';
      requestAnimationFrame(() => {
        logoImg.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      });
    });

    // Background fades in sync with the logo slide
    setTimeout(() => {
      splash.style.transition      = 'background-color 1.4s ease';
      splash.style.backgroundColor = 'transparent';
    }, 0);

    // Logo has landed — show the real nav logo and tear down the splash
    setTimeout(() => {
      navLogo.style.transition = 'opacity 0.2s ease';
      navLogo.style.opacity    = '1';
      splash.classList.add('gone');
      document.documentElement.style.overflow = '';
      sessionStorage.setItem('ap_intro_seen', '1');
    }, 1500);

  }, 3500);
})();

(() => {
  'use strict';

  // ----- Current year in footer -----
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ----- Nav scroll effect -----
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ----- Mobile nav toggle -----
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  function closeMobileNav() {
    if (!toggle || !navLinks) return;
    navLinks.classList.remove('open');
    navLinks.style.display = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      if (isOpen) {
        navLinks.style.display = 'flex';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.flexDirection = 'column';
        navLinks.style.padding = '20px';
        navLinks.style.background = 'rgba(10, 10, 15, 0.95)';
        navLinks.style.backdropFilter = 'blur(20px)';
        navLinks.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
      } else {
        navLinks.style.display = '';
      }
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMobileNav);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMobileNav();
    });
  }

  // ----- Reveal-on-scroll animations -----
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(el => io.observe(el));

  // ----- Animated stat counters -----
  const stats = document.querySelectorAll('.stat-num');
  const statIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  stats.forEach(s => statIo.observe(s));

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '+';
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ----- Smooth-scroll offset for fixed nav -----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ----- Rotating headline (hospitality <-> programming) -----
  const rotator = document.querySelector('.rotator');
  if (rotator && !prefersReducedMotion) {
    const phrases = [
      { text: 'I lead floors',   tone: 'warm' },
      { text: 'I write code',    tone: 'cool' },
      { text: 'I run the rush',  tone: 'warm' },
      { text: 'I ship features', tone: 'cool' },
      { text: 'I coach teams',   tone: 'warm' },
      { text: 'I squash bugs',   tone: 'cool' },
      { text: 'I open doors',    tone: 'warm' },
      { text: 'I learn fast',    tone: 'cool' },
    ];

    let i = 0;
    const swap = () => {
      const current = rotator.querySelector('.rotator-text');
      current.classList.add('rot-out');
      setTimeout(() => {
        i = (i + 1) % phrases.length;
        const next = phrases[i];
        rotator.innerHTML =
          `<span class="rotator-sizer" aria-hidden="true">I ship features</span>` +
          `<span class="rotator-text rot-${next.tone}">${next.text}</span>`;
      }, 320);
    };
    setInterval(swap, 2600);
  }

  // ----- Subtle parallax for hero photo -----
  const photoFrame = document.querySelector('.photo-frame');
  if (photoFrame && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    const heroPhoto = document.querySelector('.hero-photo');
    heroPhoto.addEventListener('mousemove', (e) => {
      const rect = heroPhoto.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      photoFrame.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    heroPhoto.addEventListener('mouseleave', () => {
      photoFrame.style.transform = '';
    });
  }
})();
